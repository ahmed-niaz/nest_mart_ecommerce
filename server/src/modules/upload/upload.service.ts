import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nestmart_products',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new BadRequestException(
                `Cloudinary Upload Failed: ${error?.message || 'Unknown error'}`,
              ),
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
  ): Promise<{ url: string; publicId: string }[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      throw new BadRequestException('No publicId provided');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error) => {
        if (error) {
          return reject(
            new BadRequestException(
              `Cloudinary Delete Failed: ${error?.message || 'Unknown error'}`,
            ),
          );
        }
        resolve();
      });
    });
  }
}
