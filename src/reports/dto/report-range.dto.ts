import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ReportRangeDto {
  @ApiProperty({
    example: '2026-02-01',
    description: 'Start date (inclusive)',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-02-07',
    description: 'End date (inclusive)',
  })
  @IsDateString()
  endDate: string;
}
