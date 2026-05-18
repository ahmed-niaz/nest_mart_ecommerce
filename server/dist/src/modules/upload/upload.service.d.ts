import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
    }>;
    uploadImages(files: Express.Multer.File[]): Promise<{
        url: string;
        publicId: string;
    }[]>;
}
