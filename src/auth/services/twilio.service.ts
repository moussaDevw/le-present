import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: Twilio;
  private twilioPhoneNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioPhoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER') || '';

    if (accountSid && authToken) {
      this.twilioClient = new Twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials not fully set. SMS service will mock sending.');
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        this.logger.debug(`[MOCK SMS] To: ${to} | Message: ${message}`);
        return true;
      }

      await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to,
      });
      
      this.logger.log(`SMS successfully sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      // In production you might want to throw error or handle it smoothly
      return false;
    }
  }
}
