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
    const cloudinaryUrl = this.configService.get<string>(
      'cloudinary.cloudUrl',
    );

    if (!cloudinaryUrl) {
      throw new Error('CLOUDINARY_URL is not configured');
    }

    // Cloudinary SDK parses credentials from process.env.CLOUDINARY_URL
    process.env.CLOUDINARY_URL = cloudinaryUrl;
    cloudinary.config(true);
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

    // Enforce max 3 media per product
    if (product.media.length >= 3) {
      throw new BadRequestException(
        'Maximum of 3 media files allowed per product',
      );
    }

    if (!file) {
      throw new BadRequestException('No media file provided');
    }

    const uploadOptions = {
      resource_type: 'auto' as const, // image or video
      folder: 'jossy-diva/products',
    };

    let uploadResult: {
      resource_type: string;
      secure_url: string;
      public_id: string;
    };

    // Support both disk storage (path) and memory storage (buffer)
    if (file.path) {
      uploadResult = await cloudinary.uploader.upload(
        file.path,
        uploadOptions,
      );
    } else if (file.buffer) {
      uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error || !result) {
              reject(
                error ??
                  new Error('Cloudinary upload failed'),
              );
              return;
            }
            resolve(result);
          },
        );

        stream.end(file.buffer);
      });
    } else {
      throw new BadRequestException(
        'Invalid media file payload',
      );
    }

    const mediaType =
      uploadResult.resource_type === 'video'
        ? 'VIDEO'
        : 'IMAGE';

    // Save media record
    const media = await this.prisma.productMedia.create({
      data: {
        productId: product.id,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: mediaType,
      },
      select: {
        id: true,
        productId: true,
        url: true,
        type: true,
        createdAt: true,
      },
    });

    return media;
  }

  async deleteProductMedia(mediaId: string) {
    const media = await this.prisma.productMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    try {
      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.type === 'VIDEO' ? 'video' : 'image',
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to delete media from storage',
      );
    }

    return this.prisma.productMedia.delete({
      where: { id: mediaId },
      select: {
        id: true,
        productId: true,
        url: true,
        type: true,
        createdAt: true,
      },
    });
  }
}
