// dto/create-task.dto.ts
import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
