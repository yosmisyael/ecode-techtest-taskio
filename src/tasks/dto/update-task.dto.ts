import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isStarred?: boolean;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
