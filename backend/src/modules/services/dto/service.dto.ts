import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  durationMin: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  moduleKey?: string;

  @IsString()
  @IsOptional()
  doctorId?: string;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  durationMin?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
