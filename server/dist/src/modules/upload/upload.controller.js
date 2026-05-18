var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service.js';
let UploadController = class UploadController {
    uploadService;
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async uploadImage(file) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        return this.uploadService.uploadImage(file);
    }
    async uploadImages(files) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }
        return this.uploadService.uploadImages(files);
    }
};
__decorate([
    Post('image'),
    UseInterceptors(FileInterceptor('file')),
    __param(0, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
__decorate([
    Post('images'),
    UseInterceptors(FilesInterceptor('files')),
    __param(0, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImages", null);
UploadController = __decorate([
    Controller('uploads'),
    __metadata("design:paramtypes", [UploadService])
], UploadController);
export { UploadController };
//# sourceMappingURL=upload.controller.js.map