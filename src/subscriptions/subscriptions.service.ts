import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { AasApiService } from '../quotes/services/aas-api.service';
import { CreateSubscriptionInput } from './dto/create-subscription.input';
import { InsuranceStatus, Periodicity } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aasApi: AasApiService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async createSubscription(userId: number, input: CreateSubscriptionInput) {
    this.logger.log(`Tentative de création de souscription - User: ${userId}, QuoteId: ${input.quoteId}`);

    // 1. Récupération du devis
    const quote = await this.prisma.insuranceQuote.findUnique({
      where: { id: input.quoteId },
      include: {
        vehicle: { include: { genre: { include: { category: true } } } },
        product: true,
        user: true,
      },
    });

    if (!quote) {
      this.logger.warn(`Devis ${input.quoteId} non trouvé en base de données.`);
      throw new NotFoundException('Devis introuvable.');
    }

    if (quote.userId !== userId) {
      this.logger.warn(`Accès refusé : Le devis ${input.quoteId} appartient à l'utilisateur ${quote.userId}, mais l'utilisateur connecté est ${userId}`);
      throw new NotFoundException('Devis non autorisé.');
    }

    this.logger.log(`Devis ${input.quoteId} validé pour l'utilisateur ${userId}`);

    // Vérifier si une assurance existe déjà pour ce devis
    const existingInsurance = await this.prisma.insurance.findUnique({
      where: { quoteId: quote.id },
    });
    if (existingInsurance) {
      throw new BadRequestException('Une souscription existe déjà pour ce devis.');
    }

    // 2. Préparation des informations Assuré / Souscripteur
    const souscripteur = input.souscripteur || {
      firstName: quote.user.firstName,
      lastName: quote.user.lastName,
      phone: quote.user.phone,
      email: quote.user.email,
    };

    const assure = input.assure || souscripteur;

    const dateEffet = input.dateEffet || new Date().toISOString().split('T')[0];

    // 3. Appel à l'API AAS pour la génération réelle
    const catCode = quote.vehicle.genre.category.code;
    const quoteResponse = quote.rawResponse as any;

    // Comme spécifié par l'utilisateur, le champ 'data' de la réponse AAS contient le prix à payer
    // qui doit être envoyé comme responsabilité civile lors de la souscription.
    const rcAmount = quoteResponse?.data ? Number(quoteResponse.data) : Number(quote.price);

    let aasResponse: any;

    const commonPayload = {
      responsabiliteCivile: rcAmount,
      dateEffet,
      police: `500-2024200001`,
      duree: quote.duration,
      periodicite: quote.periodicity,
      typePersonne: input.souscripteur?.personType || 'PHYSIQUE',
      souscripteur: {
        nom: souscripteur.lastName,
        prenom: souscripteur.firstName,
        cellulaire: souscripteur.phone,
        email: souscripteur.email,
      },
      assure: {
        nom: assure.lastName,
        prenom: assure.firstName,
        cellulaire: assure.phone,
        email: assure.email,
      },
      vehicule: {
        puissanceFiscale: quote.vehicle.fiscalPower || 5,
        dateMiseCirculation: quote.vehicle.circulationDate?.toISOString().split('T')[0] || '2000-01-01',
        nombrePlace: quote.vehicle.numberOfSeats || 5,
        valeurNeuve: Number(quote.vehicle.valueNew) || 0,
        valeurActuelle: Number(quote.vehicle.valueCurrent) || 0,
        immatriculation: quote.vehicle.licensePlate || '',
        energie: quote.vehicle.energyType,
        genre: quote.vehicle.genre.code,
        modele: quote.vehicle.model || 'Inconnu',
        marque: quote.vehicle.brand || 'Inconnu',
        chassis: quote.vehicle.chassis || '',
      },
      referenceTrxPartner: `TRX-${uuidv4().substring(0, 12).toUpperCase()}`,
      garanties: quote.rawRequest?.['garanties'] || [], // On récupère les garanties du devis
    };

    // 3. Appel à l'API AAS reporté après le paiement.
    // On enregistre simplement la souscription en attente (PENDING) avec le payload préparé.

    // 4. Calcul des dates
    const startDate = new Date(dateEffet);
    const endDate = new Date(startDate);
    if (quote.periodicity === Periodicity.MOIS) {
      endDate.setMonth(endDate.getMonth() + quote.duration);
    } else {
      endDate.setDate(endDate.getDate() + quote.duration);
    }

    // 5. Sauvegarde en base de données (Transaction Prisma)
    return this.prisma.$transaction(async (tx) => {
      // Création de l'assurance
      const insurance = await tx.insurance.create({
        data: {
          userId,
          vehicleId: quote.vehicleId,
          companyId: quote.companyId,
          productId: quote.productId,
          quoteId: quote.id,
          policyNumber: `PENDING-${uuidv4().substring(0, 8).toUpperCase()}`,
          externalPartnerRef: commonPayload.referenceTrxPartner,
          duration: quote.duration,
          periodicity: quote.periodicity,
          responsibilityCivilAmount: rcAmount,
          status: InsuranceStatus.PENDING,
          startDate,
          endDate,
          detail: {
            create: {
              rawRequest: commonPayload as any,
            }
          },
          parties: {
            createMany: {
              data: [
                {
                  type: 'SOUSCRIPTEUR',
                  firstName: souscripteur.firstName,
                  lastName: souscripteur.lastName,
                  phone: souscripteur.phone,
                  email: souscripteur.email,
                  personType: input.souscripteur?.personType || 'PHYSIQUE',
                },
                {
                  type: 'ASSURE',
                  firstName: assure.firstName,
                  lastName: assure.lastName,
                  phone: assure.phone,
                  email: assure.email,
                  personType: input.assure?.personType || 'PHYSIQUE',
                }
              ]
            }
          }
        }
      });

      // Création de la facture
      await tx.invoice.create({
        data: {
          userId,
          reference: `INV-${uuidv4().substring(0, 8).toUpperCase()}`,
          subtotal: quote.price,
          total: quote.price,
          items: {
            create: {
              insuranceId: insurance.id,
              label: `Assurance Auto - ${quote.vehicle.brand} ${quote.vehicle.model}`,
              amount: quote.price,
            }
          }
        }
      });

      return insurance;
    });
  }

  async mySubscriptions(userId: number) {
    return this.prisma.insurance.findMany({
      where: { userId },
      include: {
        vehicle: true,
        company: true,
        product: true,
        detail: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async activateSubscription(insuranceId: number) {
    this.logger.log(`Activation de la souscription ${insuranceId}`);

    const insurance = await this.prisma.insurance.findUnique({
      where: { id: insuranceId },
      include: {
        vehicle: { include: { genre: { include: { category: true } } } },
        detail: true,
      },
    });

    if (!insurance || !insurance.detail || !insurance.detail.rawRequest) {
      throw new NotFoundException('Assurance ou détails introuvables.');
    }

    const catCode = insurance.vehicle.genre.category.code;
    const commonPayload = insurance.detail.rawRequest as any;

    let aasResponse: any;

    try {
      if (catCode === 'C5') {
        aasResponse = await this.aasApi.generateAttestationMoto(commonPayload);
      } else if (catCode === 'BUS_ECOLE') {
        aasResponse = await this.aasApi.generateAttestationBus(commonPayload);
      } else if (catCode === 'C6') {
        aasResponse = await this.aasApi.generateAttestationGarage(commonPayload);
      } else {
        aasResponse = await this.aasApi.generateAttestationMono(commonPayload);
      }
    } catch (error) {
      this.logger.error('Erreur lors de la génération de l\'attestation AAS (Activation)', error);
      throw error;
    }

    this.logger.debug(`[DEBUG] Réponse complète de AAS : ${JSON.stringify(aasResponse)}`);

    // Mise à jour de l'assurance sur Cloudinary
    let cloudinaryAttestationUrl = aasResponse.linkAttestation;
    let cloudinaryCarteBruneUrl = aasResponse.linkCarteBrune;

    try {
      if (aasResponse.linkAttestation) {
        this.logger.log(`Traitement de l'attestation pour l'assurance ${insuranceId}`);
        const result = await this.cloudinary.uploadFromUrl(aasResponse.linkAttestation, `attestation_${insuranceId}`);
        cloudinaryAttestationUrl = result.secure_url;
      }
      
      if (aasResponse.linkCarteBrune) {
        this.logger.log(`Traitement de la carte brune pour l'assurance ${insuranceId}`);
        const result = await this.cloudinary.uploadFromUrl(aasResponse.linkCarteBrune, `carte_brune_${insuranceId}`);
        cloudinaryCarteBruneUrl = result.secure_url;
      }
    } catch (error) {
      this.logger.error('Erreur lors du transfert vers Cloudinary', error);
      // On continue avec les liens originaux en cas d'erreur
    }

    // Mise à jour de l'assurance en base
    return this.prisma.insurance.update({
      where: { id: insuranceId },
      data: {
        policyNumber: aasResponse.attestationNumber || commonPayload.police,
        externalPartnerRef: aasResponse.data?.referenceExterne || commonPayload.referenceTrxPartner,
        status: InsuranceStatus.ACTIVE,
        detail: {
          update: {
            attestationNumber: aasResponse.attestationNumber,
            linkAttestation: cloudinaryAttestationUrl,
            linkCarteBrune: cloudinaryCarteBruneUrl,
            rawResponse: aasResponse as any,
          }
        }
      }
    });
  }
}
