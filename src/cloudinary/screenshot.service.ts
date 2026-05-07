import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);

  async captureUrl(url: string): Promise<Buffer | string> {
    this.logger.log(`Analyse de la page pour trouver le PDF : ${url}`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      let pdfUrl: string | null = null;

      // On écoute toutes les requêtes réseau pour intercepter le PDF
      page.on('request', request => {
        const reqUrl = request.url();
        if (reqUrl.toLowerCase().includes('.pdf') || reqUrl.includes('print') || reqUrl.includes('download')) {
          this.logger.log(`Lien PDF potentiel détecté : ${reqUrl}`);
          pdfUrl = reqUrl;
        }
      });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // On attend un peu que le script de la page se lance
      await new Promise(resolve => setTimeout(resolve, 5000));

      if (pdfUrl) {
        this.logger.log(`PDF trouvé via interception réseau : ${pdfUrl}`);
        return pdfUrl;
      }

      // Si on n'a pas trouvé de lien PDF par interception, on prend une capture par défaut
      this.logger.warn('Aucun lien PDF intercepté, capture d\'écran de secours.');
      const buffer = await page.screenshot({ type: 'jpeg', quality: 90 });
      return buffer as Buffer;
    } finally {
      await browser.close();
    }
  }
}
