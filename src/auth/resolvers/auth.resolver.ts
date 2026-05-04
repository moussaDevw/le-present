import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from '../services/auth.service';
import { AuthPayload, VerifyOtpResponse, SuccessResponse } from '../models/auth.models';
import { SendOtpInput, VerifyOtpInput, RegisterUserInput, RefreshTokenInput } from '../dto/auth.inputs';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AuthResolver {
  constructor(private authService: AuthService) { }

  @Public()
  @Mutation(() => SuccessResponse)
  async sendOtp(@Args('input') input: SendOtpInput): Promise<SuccessResponse> {
    console.log("input: ", input);
    const success = await this.authService.sendOtp(input.phone);
    return { success, message: "Le SMS a été envoyé avec succès." };
  }

  @Public()
  @Mutation(() => VerifyOtpResponse)
  async verifyOtp(@Args('input') input: VerifyOtpInput): Promise<VerifyOtpResponse> {
    return this.authService.verifyOtp(input);
  }

  @Public()
  @Mutation(() => AuthPayload)
  async registerWithOtp(@Args('input') input: RegisterUserInput): Promise<AuthPayload> {
    return this.authService.registerUser(input);
  }

  @Public()
  @Mutation(() => AuthPayload)
  async refreshToken(@Args('input') input: RefreshTokenInput): Promise<AuthPayload> {
    return this.authService.refreshToken(input.token);
  }

  @Mutation(() => SuccessResponse)
  async logout(@CurrentUser() user: any): Promise<SuccessResponse> {
    await this.authService.logout(user.userId);
    return { success: true, message: "Déconnexion réussie." };
  }
}
