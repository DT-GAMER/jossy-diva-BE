import { ApiProperty } from '@nestjs/swagger';

export class PublicAccountDetailsDto {
  @ApiProperty({ example: 'Access Bank', nullable: true })
  bankName?: string | null;

  @ApiProperty({ example: 'Jossy Diva Collections', nullable: true })
  accountName?: string | null;

  @ApiProperty({ example: '0123456789', nullable: true })
  accountNumber?: string | null;
}
