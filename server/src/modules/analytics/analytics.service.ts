import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    // 1. Total Revenue
    const revenueSum = await this.prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });
    const totalRevenue = revenueSum._sum.total
      ? Number(revenueSum._sum.total)
      : 0;

    // 2. Total Orders
    const totalOrders = await this.prisma.order.count();

    // 3. Active Products
    const activeProducts = await this.prisma.product.count({
      where: { status: 'ACTIVE' },
    });

    // 4. Total Users
    const totalUsers = await this.prisma.user.count();

    return {
      totalRevenue,
      totalOrders,
      activeProducts,
      totalUsers,
    };
  }

  async getDailySales() {
    return this.prisma.dailySalesStat.findMany({
      orderBy: { date: 'asc' },
    });
  }

  async getTopProducts(limit = 10) {
    return this.prisma.productAnalytics.findMany({
      take: limit,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        salesCount: 'desc',
      },
    });
  }
}
