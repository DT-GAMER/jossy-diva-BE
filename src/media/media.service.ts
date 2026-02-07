import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadedMediaFile } from './types/uploaded-media-file.type';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloudName'),
      api_key: this.configService.get('cloudinary.apiKey'),
      api_secret: this.configService.get('cloudinary.apiSecret'),
    });
  }

  async uploadProductMedia(
    productId: string,
    file: UploadedMediaFile,
  ) {
    // Ensure product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { media: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Enforce max 2 media per product
    if (product.media.length >= 2) {
      throw new BadRequestException(
        'Maximum of 2 media files allowed per product',
      );
    }

    if (!file) {
      throw new BadRequestException('No media file provided');
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      file.path,
      {
        resource_type: 'auto', // image or video
        folder: 'jossy-diva/products',
      },
    );

    const mediaType =
      uploadResult.resource_type === 'video'
        ? 'VIDEO'
        : 'IMAGE';

    // Save media record
    const media = await this.prisma.productMedia.create({
      data: {
        productId: product.id,
        url: uploadResult.secure_url,
        type: mediaType,
      },
    });

    return media;
  }
}
