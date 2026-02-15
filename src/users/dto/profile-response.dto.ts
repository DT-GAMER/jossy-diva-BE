import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class ProfileResponseDto {
  @ApiProperty({ example: 'f61b2ace-67d4-4a56-8bfa-0f9bd3a4122c' })
  id: string;

  @ApiProperty({ example: 'Jossy Diva' })
  name: string;

  @ApiProperty({ example: 'admin@jossydiva.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;

  @ApiProperty({ example: 'Access Bank', nullable: true })
  bankName?: string | null;

  @ApiProperty({ example: 'Jossy Diva Collections', nullable: true })
  accountName?: string | null;

  @ApiProperty({ example: '0123456789', nullable: true })
  accountNumber?: string | null;
}
