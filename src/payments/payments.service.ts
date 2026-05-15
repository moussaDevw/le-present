import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { InitiatePaymentInput } from './dto/initiate-payment.input';
import { PaymentStatus, InsuranceStatus, InvoiceStatus, PaymentProvider } from '@prisma/client';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly bictorysBaseUrl = 'https://api.test.bictorys.com/pay/v1'; // Mode Test par défaut

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  private mapProviderToBictorys(provider: PaymentProvider): string {
    switch (provider) {
      case PaymentProvider.WAVE:
        return 'wave_money';
      case PaymentProvider.ORANGE:
        return 'orange_money';
      case PaymentProvider.FREE:
        return 'free_money';
      default:
        return 'wave_money';
    }
  }

  async initiatePayment(userId: number, input: InitiatePaymentInput) {
    const { insuranceId, provider } = input;
    const paymentKey = this.config.get<string>('PAYMENT_KEY');

    if (!paymentKey) {
      throw new Error('PAYMENT_KEY is not configured in environment variables.');
    }

    // 1. Vérifier l'assurance et sa facture
    const insurance = await this.prisma.insurance.findUnique({
      where: { id: insuranceId },
      include: { 
        user: true,
        invoiceItems: { include: { invoice: true } }
      },
    });

    if (!insurance || insurance.userId !== userId) {
      throw new NotFoundException('Assurance introuvable ou non autorisée.');
    }

    if (insurance.status !== InsuranceStatus.PENDING) {
      throw new BadRequestException('Cette assurance n\'est plus en attente de paiement.');
    }

    const invoice = insurance.invoiceItems[0]?.invoice;
    if (!invoice) {
      throw new NotFoundException('Facture introuvable pour cette assurance.');
    }

    // 2. Préparation du payload pour Bictorys
    const bictorysPaymentType = this.mapProviderToBictorys(provider);
    const paymentReference = `INS-${insuranceId}-${Date.now()}`;

    // Formatage du numéro de téléphone (Bictorys attend souvent le format international avec +)
    let formattedPhone = insurance.user.phone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('221')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+221' + formattedPhone;
      }
    }

    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'https://assure-present.sn';
    const payload = {
      amount: Number(invoice.total),
      currency: 'XOF',
      paymentReference: paymentReference,
      successRedirectUrl: `${frontendUrl}/dashboard/subscriptions/success`,
      errorRedirectUrl: `${frontendUrl}/dashboard/subscriptions/error`,
      customer: {
        name: `${insurance.user.firstName} ${insurance.user.lastName}`,
        phone: formattedPhone,
        email: insurance.user.email || 'customer@example.com',
      }
    };

    try {
      this.logger.log(`Appel Bictorys pour l'assurance ${insuranceId} (${bictorysPaymentType})`);
      
      const response = await fetch(`${this.bictorysBaseUrl}/charges?payment_type=${bictorysPaymentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': paymentKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as any;
      this.logger.debug(`Bictorys API Response: ${JSON.stringify(data)}`);

      if (!response.ok) {
        this.logger.error('Erreur Bictorys:', data);
        throw new BadRequestException(data.message || 'Erreur lors de l\'initialisation du paiement chez Bictorys.');
      }

      // 3. Créer l'entrée Payment en base
      await this.prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.total,
          provider,
          status: PaymentStatus.PENDING,
          externalTransactionId: data.transactionId || paymentReference,
        },
      });

      return {
        checkoutUrl: data.link || data.redirectUrl || data.checkout_url || null,
        transactionReference: data.transactionId || paymentReference,
        status: PaymentStatus.PENDING,
      };

    } catch (error) {
      this.logger.error('Erreur lors de l\'initiation du paiement:', error);
      throw error;
    }
  }

  // Vérifier le statut d'un paiement (peut être appelé par un webhook ou manuellement)
  async checkPaymentStatus(transactionId: string) {
    const paymentKey = this.config.get<string>('PAYMENT_KEY');
    
    const response = await fetch(`${this.bictorysBaseUrl}/transactions/${transactionId}`, {
      headers: {
        'X-Api-Key': paymentKey!,
      },
    });

    const data = await response.json() as any;

    if (data.status === 'SUCCESS') {
      await this.handleSuccessfulPayment(transactionId);
    }

    return data;
  }

  private async handleSuccessfulPayment(transactionId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { externalTransactionId: transactionId },
      include: { invoice: { include: { items: true } } },
    });

    if (!payment || payment.status === PaymentStatus.SUCCESS) return;

    await this.prisma.$transaction(async (tx) => {
      // 1. Marquer le paiement comme SUCCESS
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCESS },
      });

      // 2. Marquer la facture comme PAID
      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { 
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        },
      });

      // 3. Marquer l'assurance comme PAID
      for (const item of payment.invoice.items) {
        await tx.insurance.update({
          where: { id: item.insuranceId },
          data: { status: InsuranceStatus.PAID },
        });
      }
    });

    // 4. Appel à l'API partenaire (AAS) pour chaque assurance
    for (const item of payment.invoice.items) {
      try {
        await this.subscriptionsService.activateSubscription(item.insuranceId);
      } catch (error) {
        this.logger.error(`Echec de l'activation de l'assurance ${item.insuranceId} chez le partenaire`, error);
      }
    }
  }

  // Simulation pour le test local
  async simulatePaymentSuccess(transactionReference: string) {
     await this.handleSuccessfulPayment(transactionReference);
     return { success: true };
  }
}
