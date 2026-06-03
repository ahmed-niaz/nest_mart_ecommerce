import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '../../../generated/prisma/index.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: string, couponCode?: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate subtotal
    let subtotal = 0;
    cart.items.forEach((item) => {
      subtotal += Number(item.variant.price) * item.quantity;
    });

    let discountAmount = 0;
    let couponId: string | null = null;

    // Apply Coupon if provided
    if (couponCode) {
      const codeNormalized = couponCode.toUpperCase().trim();
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: codeNormalized },
      });

      if (!coupon) {
        throw new NotFoundException(
          `Coupon code "${codeNormalized}" not found`,
        );
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
          `Minimum purchase of ৳${minPurchase.toFixed(2)} is required for this coupon`,
        );
      }

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

      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }

      couponId = coupon.id;
    }

    // Calculate shipping fee (Standard: $5.00, Free over $50.00 after discount)
    const netAmount = subtotal - discountAmount;
    const shippingFee = netAmount >= 50 ? 0 : 5.0;
    const total = netAmount + shippingFee;

    // Validate Stock Level
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for item "${item.variant.product.name} - ${item.variant.sku}". Available stock: ${item.variant.stock}, requested: ${item.quantity}`,
        );
      }
    }

    // Execute transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          subtotal,
          discountAmount,
          shippingFee,
          total,
          couponId,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.variant.price,
            })),
          },
        },
        include: {
          items: {
            include: { variant: { include: { product: true } } },
          },
        },
      });

      // 2. Adjust Stock & Ledger
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: 'OUT',
            quantity: -item.quantity,
            notes: `Order checkout: #${newOrder.id}`,
            userId: null, // System action
          },
        });
      }

      // 3. Increment Coupon Use
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // 4. Update Analytics
      // Daily Sales Stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await tx.dailySalesStat.upsert({
        where: { date: today },
        create: {
          date: today,
          totalRevenue: total,
          totalOrders: 1,
          totalDiscounts: discountAmount,
        },
        update: {
          totalRevenue: { increment: total },
          totalOrders: { increment: 1 },
          totalDiscounts: { increment: discountAmount },
        },
      });

      // Product Analytics
      for (const item of cart.items) {
        const itemRevenue = Number(item.variant.price) * item.quantity;
        await tx.productAnalytics.upsert({
          where: { productId: item.variant.productId },
          create: {
            productId: item.variant.productId,
            salesCount: item.quantity,
            revenue: itemRevenue,
          },
          update: {
            salesCount: { increment: item.quantity },
            revenue: { increment: itemRevenue },
          },
        });
      }

      // 5. Clear Cart Items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
        user: { include: { profile: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
        user: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrder(id: string, dto: UpdateOrderDto) {
    await this.getOrderById(id);

    return this.prisma.order.update({
      where: { id },
      data: dto,
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    });
  }
}
