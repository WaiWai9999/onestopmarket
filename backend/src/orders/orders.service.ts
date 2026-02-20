import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY', ''));
  }

  async checkout(userId: string, dto: CreateOrderDto) {
    // Get user's cart
    const cart = await this.cartService.getCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Create order in DB with PENDING status
    const order = await this.prisma.order.create({
      data: {
        userId,
        shippingAddress: dto.shippingAddress,
        total: cart.total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // snapshot price at time of purchase
          })),
        },
      },
      include: { items: true },
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: cart.total, // amount in yen (JPY is zero-decimal currency)
      currency: 'jpy',
      metadata: { orderId: order.id },
    });

    // Save stripePaymentId to order
    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: paymentIntent.id },
    });

    return {
      orderId: order.id,
      clientSecret: paymentIntent.client_secret, // sent to frontend to complete payment
      total: cart.total,
    };
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { include: { product: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // Called by Stripe webhook after payment confirmed
  async handlePaymentSuccess(paymentIntentId: string) {
    const order = await this.prisma.order.findFirst({
      where: { stripePaymentId: paymentIntentId },
    });
    if (!order) return;

    // Update order status to PAID
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' },
    });

    // Reduce stock for each item
    const items = await this.prisma.orderItem.findMany({
      where: { orderId: order.id },
    });
    for (const item of items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear the user's cart
    await this.cartService.clearCart(order.userId);
  }
}
