import { Controller, Get, Query } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('test')
  async testConnection() {
    try {
      // Test simple avec un pixel transparent de 1x1
      const pixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64',
      );
      const result = await this.cloudinaryService.uploadFile(pixel, 'test_connection');
      return {
        success: true,
        message: 'Connexion Cloudinary réussie !',
        url: result.secure_url,
      };
    } catch (error) {
      return {
        success: false,
        message: 'La connexion Cloudinary a échoué.',
        error: error.message || error,
      };
    }
  }

  @Get('test-url')
  async testUrl(@Query('url') url: string) {
    if (!url) return { success: false, message: 'URL manquante' };
    try {
      const result = await this.cloudinaryService.uploadFromUrl(url, `test_${Date.now()}`);
      return {
        success: true,
        original_url: url,
        cloudinary_url: result.secure_url,
        preview_url: result.secure_url.replace('.pdf', '.jpg').replace('/upload/', '/upload/pg_1/')
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
