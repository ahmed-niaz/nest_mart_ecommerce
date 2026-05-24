import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateMovementDto } from './dto/create-movement.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createMovement(userId: string | null, dto: CreateMovementDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    let adjustedQty = dto.quantity;
    if (dto.type === 'IN' || dto.type === 'RETURN') {
      adjustedQty = Math.abs(dto.quantity);
    } else if (dto.type === 'OUT' || dto.type === 'DAMAGE') {
      adjustedQty = -Math.abs(dto.quantity);
    }

    if (variant.stock + adjustedQty < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current stock is ${variant.stock}, cannot adjust by ${adjustedQty}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update variant stock
      const updatedVariant = await tx.productVariant.update({
        where: { id: dto.variantId },
        data: { stock: { increment: adjustedQty } },
      });

      // 2. Create inventory movement record
      const movement = await tx.inventoryMovement.create({
        data: {
          variantId: dto.variantId,
          type: dto.type,
          quantity: adjustedQty,
          notes: dto.notes || null,
          userId: userId || null,
        },
        include: {
          variant: { include: { product: true } },
          user: { include: { profile: true } },
        },
      });

      const isLowStock =
        updatedVariant.stock <= updatedVariant.lowStockThreshold;

      return {
        movement,
        currentStock: updatedVariant.stock,
        isLowStock,
        warning: isLowStock
          ? `Stock warning: Stock for variant ${updatedVariant.sku} is now ${updatedVariant.stock}, which is at or below the threshold of ${updatedVariant.lowStockThreshold}`
          : null,
      };
    });
  }

  async getLowStockAlerts() {
    // Under Prisma, we can find variants where stock <= lowStockThreshold
    // We fetch all variants first or write a raw query. Wait, we can use prisma filtering!
    // Since lowStockThreshold is a column on the variant itself, Prisma v5/6/7 supports field comparisons using `db.expr` or we can filter them.
    // Wait, prisma filter comparing two fields on same model:
    // It's supported in Prisma v5.x+ using `where: { stock: { lte: prisma.productVariant.fields.lowStockThreshold } }` style or raw queries or just filtering in JS.
    // Since the database of single-vendor grocery app is small, loading variants and filtering in JS or doing a simple raw query is fine, but wait!
    // We can also fetch where stock <= 5 (since lowStockThreshold is 5 by default), or do a prisma raw query or field comparison:
    // Under postgres:
    // SELECT * FROM "ProductVariant" WHERE "stock" <= "lowStockThreshold"
    // Let's write a standard prisma query:
    // Prisma supports comparison using `where: { stock: { lte: undefined } }` but comparing two columns in Prisma is not directly supported without $queryRaw or using the prisma.db.expr / prisma.field comparison.
    // Let's write a prisma raw query for maximum reliability and efficiency under Prisma:
    // Wait, let's look at the mapping or table name of ProductVariant. In schema.prisma:
    // `model ProductVariant {`
    // In PostgreSQL, by default Prisma maps models to CamelCase or lower_snake_case if not annotated.
    // Let's check schema.prisma:
    // ```prisma
    // model ProductVariant {
    //   id        String   @id @default(uuid()) @db.Uuid
    //   sku       String   @unique
    // ...
    // ```
    // So the table name is `"ProductVariant"`.
    // Wait, we can write:
    // `this.prisma.productVariant.findMany({ include: { product: true } })` and then filter in memory:
    // `variants.filter(v => v.stock <= v.lowStockThreshold)`. This is 100% database-provider agnostic, completely safe, and avoids raw SQL dialect pitfalls.
    // Since this is a NestJS backend and it's highly readable and type-safe, filtering in memory is perfectly appropriate for single-vendor grocery stores. Let's do that!
    const variants = await this.prisma.productVariant.findMany({
      include: { product: true },
    });
    return variants.filter((v) => v.stock <= v.lowStockThreshold);
  }

  async getMovements() {
    return this.prisma.inventoryMovement.findMany({
      include: {
        variant: { include: { product: true } },
        user: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMovementsByVariant(variantId: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { variantId },
      include: {
        user: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateThreshold(variantId: string, lowStockThreshold: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { lowStockThreshold },
      include: { product: true },
    });
  }
}
