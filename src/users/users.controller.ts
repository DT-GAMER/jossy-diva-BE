// src/users/users.controller.ts

import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'auth', version: '1' })
@UseGuards(JwtAuthGuard)
@AdminOnly()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get admin profile
   */
  @Get('me')
  @ApiOkResponse({ type: ProfileResponseDto })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * Update admin profile
   */
  @Put('me')
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ type: ProfileResponseDto })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  /**
   * Patch admin profile
   */
  @Patch('me')
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ type: ProfileResponseDto })
  patchProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }
}
