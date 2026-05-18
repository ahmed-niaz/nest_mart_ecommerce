import { UploadService } from './upload.service.js';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
    }>;
    uploadImages(files: Express.Multer.File[]): Promise<{
        url: string;
        publicId: string;
    }[]>;
}
