import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { UploadModule } from '../common/upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
