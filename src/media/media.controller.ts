// src/media/media.controller.ts

import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaResponseDto } from './dto/media-response.dto';
import type { UploadedMediaFile } from './types/uploaded-media-file.type';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';

@ApiTags('Media')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'media', version: '1' })
@UseGuards(JwtAuthGuard)
@AdminOnly()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadMediaDto })
  @ApiCreatedResponse({ type: MediaResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: UploadedMediaFile,
    @Body() dto: UploadMediaDto,
  ) {
    return this.mediaService.uploadProductMedia(
      dto.productId,
      file,
    );
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e',
  })
  @ApiOkResponse({ type: MediaResponseDto })
  remove(@Param('id') id: string) {
    return this.mediaService.deleteProductMedia(id);
  }
}
