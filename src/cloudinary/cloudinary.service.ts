import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
const toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadFromUrl(url: string, fileName: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return cloudinary.uploader.upload(url, {
      folder: 'assure-present',
      public_id: fileName,
      resource_type: 'image', // Forcé en image pour permettre la transformation PDF -> JPG
    });
  }

  async uploadFile(fileBuffer: Buffer, fileName: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'assure-present',
          public_id: fileName,
          resource_type: 'image', // Forcé en image
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload result is undefined'));
          resolve(result);
        },
      );
      toStream(fileBuffer).pipe(upload);
    });
  }
}
