import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AasQuoteResponse {
  operationStatus: string;
  operationMessage: string;
  data: string;
  PrimeRC: string;
  Reduction: string;
  CoutPolice: string;
  PrimeAG: string;
  Taxe: string;
  Fga: string;
  Cedeao: string;
  PrimeTotale: string;
  error?: string;
  error_descrip?: string;
}

@Injectable()
export class AasApiService {
  private readonly logger = new Logger(AasApiService.name);
  private readonly baseUrl = 'https://kiiraytest.lasecu-assurances.sn/api/v1';
  
  // Correction: 'partner' au lieu de la typo 'partener' qui provoquait une 404 NOT FOUND
  private readonly partner = 'partner'; 
  private readonly username = 'ass';
  private readonly password = 'd00bb98b-24e3-445a-8055-282e058fcf88';

  constructor(private configService: ConfigService) {}

  private getHeaders() {
    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fonction utilitaire générique pour envoyer des requêtes sécurisées à AAS
   * et capturer intelligemment les erreurs HTML ou réseau.
   */
  private async executeFetch(url: string, payload: any): Promise<AasQuoteResponse> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const textData = await response.text();
      let data: AasQuoteResponse;
      try {
        data = JSON.parse(textData);
      } catch (parseError) {
        this.logger.error(`AAS API - Parse Error [Http ${response.status}] => ${textData.substring(0, 500)}`);
        throw new Error(`La réponse de l'API AAS n'est pas un JSON valide (Http ${response.status}).`);
      }

      if (!response.ok || data.operationStatus !== 'SUCCESS') {
        this.logger.error(`AAS API - Logical Error [Http ${response.status}] => ${JSON.stringify(data)}`);
        const errorMsg = data.operationMessage || data.error_descrip || data.error || JSON.stringify(data);
        throw new InternalServerErrorException(`Erreur AAS : ${errorMsg}`);
      }

      return data;
    } catch (error) {
      this.logger.error(`AAS API - Fail [${url}] => ${error.message}`);
      
      // Si c'est déjà une InternalServerErrorException (déclenchée juste au-dessus), on la relance
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      // Sinon, c'est une erreur technique globale (Fetch non défini, erreur réseau, DNS, 404)
      throw new InternalServerErrorException(`Erreur partenaire: ${error.message}`);
    }
  }

  async getRcMono(payload: any): Promise<AasQuoteResponse> {
    this.logger.debug(`Appel AAS getRcMono sur /rc.request`, payload);
    return this.executeFetch(`${this.baseUrl}/${this.partner}/rc.request`, payload);
  }

  async getRcMoto(payload: any): Promise<AasQuoteResponse> {
    this.logger.debug(`Appel AAS getRcMoto sur /rc.moto`, payload);
    return this.executeFetch(`${this.baseUrl}/${this.partner}/rc.moto`, payload);
  }

  async getRcBusEcole(payload: any): Promise<AasQuoteResponse> {
    this.logger.debug(`Appel AAS getRcBusEcole sur /bus.ecole.rc`, payload);
    return this.executeFetch(`${this.baseUrl}/${this.partner}/bus.ecole.rc`, payload);
  }

  async getRcGarage(payload: any): Promise<AasQuoteResponse> {
    this.logger.debug(`Appel AAS getRcGarage sur /rc.garage`, payload);
    return this.executeFetch(`${this.baseUrl}/${this.partner}/rc.garage`, payload);
  }

  // --- GENERATION D'ATTESTATIONS (QR CODE) ---

  async generateAttestationMono(payload: any): Promise<AasQuoteResponse> {
    this.logger.debug(`Appel AAS generateAttestationMono sur /qrcode.request`, payload);
    return this.executeFetch(`${this.baseUrl}/${this.partner}/qrcode.request`, payload);
  }

  async generateAttestationMoto(payload: any): Promise<AasQuoteResponse> {
    this.logger.debug(`Appel AAS generateAttestationMoto sur /moto-qrcode-request`, payload);
    return this.executeFetch(`${this.baseUrl}/${this.partner}/moto-qrcode-request`, payload);
  }

  async generateAttestationBus(payload: any): Promise<AasQuoteResponse> {
    this.logger.debug(`Appel AAS generateAttestationBus sur /bus.ecole.rc-qrcode-request`, payload);
    return this.executeFetch(`${this.baseUrl}/${this.partner}/bus.ecole.rc-qrcode-request`, payload);
  }

  async generateAttestationGarage(payload: any): Promise<AasQuoteResponse> {
    this.logger.debug(`Appel AAS generateAttestationGarage sur /garage.request`, payload);
    return this.executeFetch(`${this.baseUrl}/${this.partner}/garage.request`, payload);
  }
}
