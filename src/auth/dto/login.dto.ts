import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@jossydiva.com',
    description: 'Admin email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'admin666612',
    minLength: 6,
    description: 'Admin account password',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
