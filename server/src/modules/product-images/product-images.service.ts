import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UploadService } from '../upload/upload.service.js';

@Injectable()
export class ProductImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async addImage(productId: string, file: Express.Multer.File) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const uploaded = await this.uploadService.uploadImage(file);
    const newOrder = product.images.length;
    const isPrimary = product.images.length === 0;

    const newImage = await this.prisma.productImage.create({
      data: {
        productId,
        publicId: uploaded.publicId,
        url: uploaded.url,
        order: newOrder,
        isPrimary,
      },
    });

    return newImage;
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      throw new NotFoundException('Image not found for this product');
    }

    // Remove from Cloudinary
    await this.uploadService.deleteImage(image.publicId);

    // Remove from DB
    await this.prisma.productImage.delete({
      where: { id: imageId },
    });

    // If it was primary and there are other images, make the first one primary
    if (image.isPrimary) {
      const otherImages = await this.prisma.productImage.findMany({
        where: { productId },
        orderBy: { order: 'asc' },
      });
      if (otherImages.length > 0) {
        await this.prisma.productImage.update({
          where: { id: otherImages[0].id },
          data: { isPrimary: true },
        });
      }
    }

    return { message: 'Image deleted successfully' };
  }

  async setPrimary(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      throw new NotFoundException('Image not found for this product');
    }

    // Start a transaction to ensure atomic update
    await this.prisma.$transaction([
      this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      this.prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    return { message: 'Primary image updated' };
  }

  async reorderImages(productId: string, orderedImageIds: string[]) {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
    });

    // Ensure all provided IDs belong to the product
    const validIds = images.map((img) => img.id);
    const allValid = orderedImageIds.every((id) => validIds.includes(id));
    if (!allValid) {
      throw new BadRequestException('Invalid image IDs provided');
    }

    // Bulk update order
    const updates = orderedImageIds.map((id, index) =>
      this.prisma.productImage.update({
        where: { id },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    });
  }
}
