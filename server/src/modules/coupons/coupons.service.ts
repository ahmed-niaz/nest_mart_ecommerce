import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const codeNormalized = dto.code.toUpperCase().trim();
    const existing = await this.prisma.coupon.findUnique({
      where: { code: codeNormalized },
    });

    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    return this.prisma.coupon.create({
      data: {
        ...dto,
        code: codeNormalized,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);

    if (dto.code) {
      const codeNormalized = dto.code.toUpperCase().trim();
      const existing = await this.prisma.coupon.findUnique({
        where: { code: codeNormalized },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Coupon code already exists');
      }
      dto.code = codeNormalized;
    }

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.delete({
      where: { id },
    });
  }

  async validateCoupon(code: string, subtotal: number) {
    const codeNormalized = code.toUpperCase().trim();
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: codeNormalized },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon code "${codeNormalized}" not found`);
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active');
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw new BadRequestException('Coupon promotion has not started yet');
    }
    if (now > coupon.endDate) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit has been reached');
    }

    const minPurchase = coupon.minPurchaseAmount
      ? Number(coupon.minPurchaseAmount)
      : 0;
    if (subtotal < minPurchase) {
      throw new BadRequestException(
        `Minimum purchase amount of $${minPurchase.toFixed(2)} is required for this coupon`,
      );
    }

    let discountAmount = 0;
    const discountVal = Number(coupon.discountValue);

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = subtotal * (discountVal / 100);
      if (coupon.maxDiscount) {
        const maxDisc = Number(coupon.maxDiscount);
        if (discountAmount > maxDisc) {
          discountAmount = maxDisc;
        }
      }
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discountAmount = discountVal;
    }

    // Discount cannot exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return {
      isValid: true,
      discountAmount,
      coupon,
    };
  }
}
