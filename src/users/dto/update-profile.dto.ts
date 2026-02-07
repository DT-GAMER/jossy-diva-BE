import { IsOptional, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Jossy Diva',
    minLength: 2,
    description: 'Display name',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({
    example: 'admin@jossydiva.com',
    description: 'Updated admin email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
