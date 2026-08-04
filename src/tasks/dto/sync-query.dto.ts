import { IsOptional, IsISO8601 } from 'class-validator';

export class SyncQueryDto {
  @IsOptional()
  @IsISO8601()
  since?: string;
}
