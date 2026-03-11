import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  /** Public: list all available coupons */
  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  /** Auth: list user's acquired coupons */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyCoupons(@CurrentUser() user: any) {
    return this.couponsService.getMyCoupons(user.id);
  }

  /** Auth: count user's available coupons */
  @Get('my/count')
  @UseGuards(JwtAuthGuard)
  getMyCount(@CurrentUser() user: any) {
    return this.couponsService.getMyCount(user.id);
  }

  /** Auth: acquire a coupon */
  @Post(':id/acquire')
  @UseGuards(JwtAuthGuard)
  acquire(@CurrentUser() user: any, @Param('id') id: string) {
    return this.couponsService.acquire(user.id, id);
  }

  /** Auth: apply coupon code (validate + return discount) */
  @Post('apply')
  @UseGuards(JwtAuthGuard)
  apply(
    @CurrentUser() user: any,
    @Body() body: { code: string; cartTotal: number },
  ) {
    return this.couponsService.apply(user.id, body.code, body.cartTotal);
  }

  /** Admin: create coupon */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body()
    body: {
      code: string;
      description: string;
      discountType: string;
      discountValue: number;
      minPurchase?: number;
      maxUses?: number;
      category?: string;
      expiresAt: string;
    },
  ) {
    return this.couponsService.create(body);
  }

  /** Admin: delete coupon */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}
