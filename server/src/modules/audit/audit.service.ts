import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    userId: string,
    action: string,
    target: string,
    details?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        target,
        details: details || {},
      },
    });
  }

  async getLogs() {
    return this.prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
