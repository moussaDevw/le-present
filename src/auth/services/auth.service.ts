import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TwilioService } from './twilio.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { VerifyOtpInput, RegisterUserInput } from '../dto/auth.inputs';
import { AuthPayload, LoginStatus, VerifyOtpResponse } from '../models/auth.models';
import { User, RoleName } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private twilioService: TwilioService,
    private jwtService: JwtService,
  ) { }

  // Génère un OTP à 6 chiffres
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(phone: string): Promise<boolean> {
    const otp = this.generateOtpCode();
    console.log(otp)
    const smsSent = await this.twilioService.sendSms(
      phone,
      `Votre code de vérification pour l'assurance est : ${otp}`,
    );
    console.log(smsSent)
    // if (!smsSent) {
    //   throw new BadRequestException("Échec de l'envoi du SMS. Veuillez vérifier votre numéro d'appel.");
    // }

    // Invalider les anciens codes de cet utilisateur
    await this.prisma.otpCode.updateMany({
      where: { phone, isUsed: false },
      data: { isUsed: true },
    });

    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(otp, salt);

    // Expiration dans 5 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.prisma.otpCode.create({
      data: {
        phone,
        codeHash,
        expiresAt,
      },
    });

    return true;
  }

  async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResponse> {
    const { phone, code } = input;

    // Trouver le code le plus récent
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: { phone, isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Aucun code OTP actif trouvé pour ce numéro.');
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('Le code OTP a expiré.');
    }

    const isValid = await bcrypt.compare(code, otpRecord.codeHash);
    if (!isValid) {
      throw new BadRequestException('Le code OTP est invalide.');
    }

    // Marquer comme utilisé
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Chercher l'utilisateur existant
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      // REGISTRATION REQUIRED
      // Générer un token temporaire valable 10min pour sécuriser l'envoi du Profile final
      const registrationToken = this.jwtService.sign(
        { phone, purpose: 'registration' },
        { expiresIn: '10m' },
      );

      return {
        status: LoginStatus.REGISTRATION_REQUIRED,
        registrationToken,
      };
    }

    // LOGGED IN
    const payload = await this.generateTokens(user);
    return {
      status: LoginStatus.LOGGED_IN,
      payload,
    };
  }

  async registerUser(input: RegisterUserInput): Promise<AuthPayload> {
    try {
      // Valider le token
      const decoded = this.jwtService.verify(input.registrationToken);

      if (decoded.purpose !== 'registration' || !decoded.phone) {
        throw new UnauthorizedException("Jeton d'inscription invalide.");
      }

      const phone = decoded.phone;

      // Vérifier si l'utilisateur existe déjà 
      const existingUser = await this.prisma.user.findUnique({ where: { phone } });
      if (existingUser) {
        throw new BadRequestException("Un compte existe déjà pour ce numéro.");
      }

      // S'assurer que le rôle par défaut (ex: DRIVER) existe
      let defaultRole = await this.prisma.role.findUnique({ where: { name: RoleName.DRIVER } });
      if (!defaultRole) {
        defaultRole = await this.prisma.role.create({ data: { name: RoleName.DRIVER } });
      }

      const newUser = await this.prisma.user.create({
        data: {
          phone,
          firstName: input.firstName,
          lastName: input.lastName,
          isActive: true,
          roles: {
            create: {
              roleId: defaultRole.id,
            },
          },
        },
        include: { roles: { include: { role: true } } },
      });

      return await this.generateTokens(newUser);
    } catch (e) {
      throw new UnauthorizedException("Le délai d'inscription a expiré ou le jeton est corrompu.");
    }
  }

  // --- TOKEN GENERATION ---

  async generateTokens(user: any): Promise<AuthPayload> {
    const jwtPayload = {
      sub: user.id,
      phone: user.phone,
      roles: user.roles?.map(r => r.role.name) || [],
    };

    const accessToken = this.jwtService.sign(jwtPayload, { expiresIn: '15m' });
    const refreshTokenPlain = this.jwtService.sign(jwtPayload, { expiresIn: '7d' });

    // Hacher le refresh et le sauver en DB
    const salt = await bcrypt.genSalt(10);
    const tokenHash = await bcrypt.hash(refreshTokenPlain, salt);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        isRevoked: false,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenPlain,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
      },
    };
  }

  async refreshToken(oldToken: string): Promise<AuthPayload> {
    try {
      const decoded = this.jwtService.verify(oldToken);
      const userId = decoded.sub;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Utilisateur inactif ou supprimé');
      }

      // Chercher le refresh token valide en DB
      const dbTokens = await this.prisma.refreshToken.findMany({
        where: { userId, isRevoked: false },
      });

      let isValidFound = false;
      let usedDbToken: any = null;

      for (const t of dbTokens) {
        if (t.expiresAt > new Date()) {
          const matching = await bcrypt.compare(oldToken, t.tokenHash);
          if (matching) {
            isValidFound = true;
            usedDbToken = t;
            break;
          }
        }
      }

      if (!isValidFound || !usedDbToken) {
        throw new UnauthorizedException('Refresh token invalide ou expiré');
      }

      // Révoquer l'ancien token pour rotation
      await this.prisma.refreshToken.update({
        where: { id: usedDbToken.id },
        data: { isRevoked: true },
      });

      return await this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Refresh token expiré ou corrompu');
    }
  }

  async logout(userId: number): Promise<boolean> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    return true;
  }
}
