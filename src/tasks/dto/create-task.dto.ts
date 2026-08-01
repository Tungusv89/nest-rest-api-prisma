// dto/create-task.dto.ts
import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Купить молоко', minLength: 3 })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.PENDING })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
