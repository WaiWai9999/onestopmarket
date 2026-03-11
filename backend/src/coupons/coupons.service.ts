import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  /** List all active, non-expired coupons (public) */
  async findAll() {
    return this.prisma.coupon.findMany({
      where: { isActive: true, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** List coupons the user has acquired */
  async getMyCoupons(userId: string) {
    const userCoupons = await this.prisma.userCoupon.findMany({
      where: { userId },
      include: { coupon: true },
      orderBy: { createdAt: 'desc' },
    });
    return userCoupons;
  }

  /** Count user's available (unused, non-expired) coupons */
  async getMyCount(userId: string) {
    const count = await this.prisma.userCoupon.count({
      where: {
        userId,
        usedAt: null,
        coupon: { isActive: true, expiresAt: { gt: new Date() } },
      },
    });
    return { count };
  }

  /** Acquire a coupon */
  async acquire(userId: string, couponId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });
    if (!coupon) throw new NotFoundException('クーポンが見つかりません');
    if (!coupon.isActive || coupon.expiresAt < new Date()) {
      throw new BadRequestException('このクーポンは利用できません');
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('このクーポンは上限に達しました');
    }

    const existing = await this.prisma.userCoupon.findUnique({
      where: { userId_couponId: { userId, couponId } },
    });
    if (existing) throw new ConflictException('すでに取得済みです');

    const [userCoupon] = await this.prisma.$transaction([
      this.prisma.userCoupon.create({
        data: { userId, couponId },
        include: { coupon: true },
      }),
      this.prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      }),
    ]);

    return userCoupon;
  }

  /** Validate & apply a coupon code (returns discount info) */
  async apply(userId: string, code: string, cartTotal: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon || !coupon.isActive || coupon.expiresAt < new Date()) {
      throw new BadRequestException('無効なクーポンコードです');
    }

    // Check user has acquired it
    const userCoupon = await this.prisma.userCoupon.findFirst({
      where: { userId, couponId: coupon.id, usedAt: null },
    });
    if (!userCoupon) {
      throw new BadRequestException('このクーポンを取得していません');
    }

    if (cartTotal < coupon.minPurchase) {
      throw new BadRequestException(
        `¥${coupon.minPurchase.toLocaleString()}以上のご注文で利用できます`,
      );
    }

    const discount =
      coupon.discountType === 'PERCENT'
        ? Math.round(cartTotal * (coupon.discountValue / 100))
        : coupon.discountValue;

    return {
      couponId: coupon.id,
      code: coupon.code,
      discount: Math.min(discount, cartTotal),
      description: coupon.description,
    };
  }

  // ── Admin ──

  async create(data: {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    minPurchase?: number;
    maxUses?: number;
    category?: string;
    expiresAt: string;
  }) {
    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase ?? 0,
        maxUses: data.maxUses ?? null,
        category: data.category ?? null,
        expiresAt: new Date(data.expiresAt),
      },
    });
  }

  async delete(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('クーポンが見つかりません');
    await this.prisma.userCoupon.deleteMany({ where: { couponId: id } });
    return this.prisma.coupon.delete({ where: { id } });
  }
}
