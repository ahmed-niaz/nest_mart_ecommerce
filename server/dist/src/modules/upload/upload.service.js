var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
let UploadService = class UploadService {
    configService;
    constructor(configService) {
        this.configService = configService;
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadImage(file) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: 'nestmart_products',
                resource_type: 'auto',
            }, (error, result) => {
                if (error || !result) {
                    return reject(new BadRequestException(`Cloudinary Upload Failed: ${error?.message || 'Unknown error'}`));
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            });
            uploadStream.end(file.buffer);
        });
    }
    async uploadImages(files) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }
        const uploadPromises = files.map((file) => this.uploadImage(file));
        return Promise.all(uploadPromises);
    }
};
UploadService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], UploadService);
export { UploadService };
//# sourceMappingURL=upload.service.js.map