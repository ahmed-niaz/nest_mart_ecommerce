import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { Role } from '../../../generated/prisma/index.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Check if user already reviewed
    const existing = await this.prisma.review.findFirst({
      where: { userId, productId: dto.productId },
    });

    if (existing)
      throw new ConflictException('You have already reviewed this product');

    return this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  async findProductReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId)
      throw new ForbiddenException('You can only update your own review');

    return this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  async remove(id: string, userId: string, role: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    if (
      review.userId !== userId &&
      role !== Role.ADMIN &&
      role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'You are not authorized to delete this review',
      );
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }
}
