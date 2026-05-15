import { Controller, Post, Body, Headers, Logger, HttpStatus, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-bictorys-secret') secret: string, // Hypothèse sur le header
  ) {
    this.logger.log('Webhook Bictorys reçu');
    this.logger.debug(`Payload: ${JSON.stringify(body)}`);

    const expectedSecret = this.config.get<string>('BICTORYS_WEBHOOK_SECRET');

    // Validation optionnelle du secret si Bictorys l'envoie dans un header
    if (expectedSecret && secret && secret !== expectedSecret) {
      this.logger.warn('Secret Webhook invalide');
      // On peut choisir de rejeter ou de logger simplement
    }

    const transactionId = body.transactionId || body.paymentReference || body.merchantReference;
    const status = body.status;

    if (!transactionId) {
      this.logger.error('Webhook reçu sans ID de transaction');
      return { success: false, message: 'Missing transactionId' };
    }

    if (status === 'SUCCESS' || status === 'success') {
      this.logger.log(`Paiement réussi pour la transaction: ${transactionId}`);
      await this.paymentsService.checkPaymentStatus(transactionId);
    } else if (status === 'FAILED' || status === 'failed') {
      this.logger.warn(`Paiement échoué pour la transaction: ${transactionId}`);
      // Logique supplémentaire pour l'échec si nécessaire
    }

    return { success: true };
  }
}
