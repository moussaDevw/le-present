import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AasApiService, AasQuoteResponse } from './services/aas-api.service';
import { SimulateQuoteInput } from './dto/simulate-quote.input';
import { ProductCategory } from '@prisma/client';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aasApi: AasApiService,
  ) {}

  async simulateQuote(userId: number, input: SimulateQuoteInput) {
    // 1. Récupération et vérification du véhicule
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: input.vehicleId,
        ownerId: userId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        genre: { include: { category: true } },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule introuvable ou non autorisé.');
    }

    let response: AasQuoteResponse;
    const catCode = vehicle.genre.category.code;

    try {
      if (catCode === 'C5') {
        response = await this.aasApi.getRcMoto({
          cylindre: vehicle.cylinderVolume ? vehicle.cylinderVolume.toString() : '50',
          duree: input.duration.toString(),
          periodicite: input.periodicity,
          genre: vehicle.genre.code,
          energie: vehicle.energyType,
          usage: vehicle.usage || 'NON_COMMERCIAL',
          nombrePlace: vehicle.numberOfSeats ? vehicle.numberOfSeats.toString() : '2',
          cout_police: 3000,
          remise_rc: 0,
          garanties: input.garanties || [],
        });
      } else if (catCode === 'REMORQUE') {
        throw new BadRequestException('Simulation remorque nécessite un véhicule tracteur.');
      } else if (catCode === 'BUS_ECOLE') {
        response = await this.aasApi.getRcBusEcole({
          duree: input.duration,
          periodicite: input.periodicity,
          energie: vehicle.energyType,
          genre: vehicle.genre.code,
          nombrePlace: vehicle.numberOfSeats || 30,
          puissanceFiscale: vehicle.fiscalPower || 20,
          cout_police: 3000,
          remise_rc: 0,
          valeurNeuve: vehicle.valueNew ? Number(vehicle.valueNew) : 0,
          valeurActuelle: vehicle.valueCurrent ? Number(vehicle.valueCurrent) : 0,
          garanties: input.garanties || [],
        });
      } else if (catCode === 'C6') {
        response = await this.aasApi.getRcGarage({
          duree: input.duration,
          periodicite: input.periodicity,
          genre: vehicle.genre.code,
          nombreCarte: 1, // Fixe pour l'instant
          cout_police: 3000,
          remise_rc: 0,
          valeurNeuve: vehicle.valueNew ? Number(vehicle.valueNew) : 0,
          valeurActuelle: vehicle.valueCurrent ? Number(vehicle.valueCurrent) : 0,
          garanties: input.garanties || [],
        });
      } else {
        response = await this.aasApi.getRcMono({
          puissanceFiscale: vehicle.fiscalPower || 5, 
          duree: input.duration,
          periodicite: input.periodicity,
          genre: vehicle.genre.code,
          energie: vehicle.energyType,
          nombrePlace: vehicle.numberOfSeats || 5,
          valeurNeuve: vehicle.valueNew ? Number(vehicle.valueNew) : 0,
          valeurActuelle: vehicle.valueCurrent ? Number(vehicle.valueCurrent) : 0,
          cout_police: 3000,
          remise_rc: 0,
          garantiesOptPT: input.garantiesOptPT || "OPTION_1",
          garantiesOptAR: input.garantiesOptAR || "500000",
          garantiesOptAS: input.garantiesOptAS || "OPTION_1",
          garanties: input.garanties || [],
        });
      }
    } catch (error) {
      this.logger.error('Erreur durant la simulation de la tarification AAS', error);
      throw error;
    }

    // 2. Déduction intelligente de la catégorie du Produit d'assurance
    let prodCategory: ProductCategory = ProductCategory.MONO;
    if (catCode === 'C5') prodCategory = ProductCategory.MOTO;
    else if (catCode === 'REMORQUE') prodCategory = ProductCategory.REMORQUE;
    else if (catCode === 'BUS_ECOLE') prodCategory = ProductCategory.BUS_ECOLE;
    else if (catCode === 'C6') prodCategory = ProductCategory.GARAGE;
    else if (catCode === 'C7') prodCategory = ProductCategory.AUTO_ECOLE;
    else if (catCode === 'C8') prodCategory = ProductCategory.LOCATION;

    // 3. Création ou Récupération "à la volée" du Produit d'assurance
    const product = await this.prisma.insuranceProduct.upsert({
      where: {
        companyId_code: {
          companyId: input.companyId,
          code: `AUTO_${prodCategory}`,
        }
      },
      update: {}, // Aucune modif si ça existe déjà
      create: {
        companyId: input.companyId,
        code: `AUTO_${prodCategory}`,
        name: `Assurance Auto - ${prodCategory}`,
        category: prodCategory,
        description: 'Produit généré automatiquent.',
      }
    });

    // 4. Extraction du prix total "PrimeTotale" depuis la réponse AAS
    const finalPrice = response.PrimeTotale ? parseFloat(response.PrimeTotale) : 0;

    // Calcul de la date d'expiration (ex: 30 jours à partir de maintenant)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 5. Sauvegarde du devis dans Postgres
    const quote = await this.prisma.insuranceQuote.create({
      data: {
        userId,
        vehicleId: vehicle.id,
        companyId: input.companyId,
        productId: product.id,   // <--- Inséré intelligemment !
        duration: input.duration,
        periodicity: input.periodicity,
        price: finalPrice,
        expiresAt,
        rawResponse: response as any, 
      },
    });

    return quote;
  }

  async myQuotes(userId: number) {
    return this.prisma.insuranceQuote.findMany({
      where: { userId },
      include: {
        vehicle: true,
        company: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGuarantees() {
    return this.prisma.guarantee.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' }, // ou par code selon comment c'est trié dans la db
    });
  }

  async createGuarantee(data: { code: string; label: string; description?: string; isActive?: boolean }) {
    return this.prisma.guarantee.create({
      data: {
        code: data.code,
        label: data.label,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateGuarantee(id: number, data: { code?: string; label?: string; description?: string; isActive?: boolean }) {
    const guarantee = await this.prisma.guarantee.findUnique({ where: { id } });
    if (!guarantee) throw new NotFoundException('Garantie introuvable.');

    return this.prisma.guarantee.update({
      where: { id },
      data,
    });
  }
}

