import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const { search, categoryId, minPrice, maxPrice, onSale, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    // Use AND array to combine multiple OR conditions safely
    const andConditions: Record<string, unknown>[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      });
    }

    if (minPrice !== undefined) {
      andConditions.push({
        OR: [
          { AND: [{ discountPrice: { not: null } }, { discountPrice: { gte: minPrice } }] },
          { AND: [{ discountPrice: null }, { price: { gte: minPrice } }] },
        ],
      });
    }

    if (maxPrice !== undefined) {
      andConditions.push({
        OR: [
          { AND: [{ discountPrice: { not: null } }, { discountPrice: { lte: maxPrice } }] },
          { AND: [{ discountPrice: null }, { price: { lte: maxPrice } }] },
        ],
      });
    }

    const finalWhere = {
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(onSale && { discountPrice: { not: null } }),
      ...(andConditions.length > 0 && { AND: andConditions }),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: finalWhere,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: finalWhere }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id); // throws if not found
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id); // throws if not found
    // soft delete — set deletedAt instead of actually deleting
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findHotDeals(limit: number = 6) {
    const now = new Date();

    const deals = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        isHotDeal: true,
        OR: [
          { dealExpiresAt: null }, // deals without expiration
          { dealExpiresAt: { gt: now } }, // deals that haven't expired
        ],
      },
      include: { category: true },
      orderBy: [
        { dealExpiresAt: 'asc' }, // show expiring deals first
        { createdAt: 'desc' }, // then by newest
      ],
      take: limit,
    });

    return deals;
  }
}
