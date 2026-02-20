import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Get or create cart for user
  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    }

    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    return { ...cart, total };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    // Check product exists and has enough stock
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const cart = await this.getOrCreateCart(userId);

    // If product already in cart, increase quantity
    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
        include: { product: true },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
      include: { product: true },
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: { product: true },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}
