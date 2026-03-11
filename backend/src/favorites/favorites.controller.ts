import {
  Controller, Get, Post, Delete,
  Param, UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@CurrentUser() user: any) {
    return this.favoritesService.getFavorites(user.id);
  }

  @Get('count')
  getCount(@CurrentUser() user: any) {
    return this.favoritesService.getCount(user.id);
  }

  @Get(':productId/check')
  isFavorited(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.favoritesService.isFavorited(user.id, productId);
  }

  @Post(':productId')
  addFavorite(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.favoritesService.addFavorite(user.id, productId);
  }

  @Delete(':productId')
  removeFavorite(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.favoritesService.removeFavorite(user.id, productId);
  }
}
