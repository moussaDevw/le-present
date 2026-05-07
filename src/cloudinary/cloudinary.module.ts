import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryController } from './cloudinary.controller';
import { ScreenshotService } from './screenshot.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, CloudinaryService, ScreenshotService],
  controllers: [CloudinaryController],
  exports: [CloudinaryProvider, CloudinaryService, ScreenshotService],
})
export class CloudinaryModule {}
