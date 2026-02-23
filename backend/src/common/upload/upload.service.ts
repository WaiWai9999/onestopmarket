import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
    this.bucket = this.config.get<string>('AWS_S3_BUCKET', '');
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname); // e.g. .jpg
    const key = `products/${randomUUID()}${ext}`; // e.g. products/uuid.jpg

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // Return the S3 URL
    return `https://${this.bucket}.s3.${this.config.get('AWS_REGION')}.amazonaws.com/${key}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // Extract key from URL
    const url = new URL(imageUrl);
    const key = url.pathname.slice(1); // remove leading /

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
