import { ApiProperty } from '@nestjs/swagger';

export class ReportSummaryDto {
  @ApiProperty({ example: 250000 })
  revenue: number;

  @ApiProperty({ example: 85000 })
  profit: number;
}

export class ReportBySourceDto {
  @ApiProperty({ type: ReportSummaryDto })
  WALK_IN: ReportSummaryDto;

  @ApiProperty({ type: ReportSummaryDto })
  WEBSITE: ReportSummaryDto;
}

export class ReportResponseDto {
  @ApiProperty({ example: 250000 })
  revenue: number;

  @ApiProperty({ example: 85000 })
  profit: number;

  @ApiProperty({ example: 34 })
  profitMargin: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        revenue: { type: 'number', example: 120000 },
        profit: { type: 'number', example: 40000 },
      },
    },
    example: {
      MEN_SHOES: { revenue: 120000, profit: 40000 },
      PERFUMES: { revenue: 130000, profit: 45000 },
    },
  })
  byCategory: Record<string, ReportSummaryDto>;

  @ApiProperty({ type: ReportBySourceDto })
  bySource: ReportBySourceDto;

  @ApiProperty({ example: 14 })
  transactions: number;
}
