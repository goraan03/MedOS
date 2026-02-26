import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ClinicRole } from '@prisma/client';

export class UpdateClinicDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  settings?: Record<string, unknown>;
}

export class ToggleModuleDto {
  @IsString()
  @IsNotEmpty()
  moduleKey: string;

  @IsBoolean()
  enabled: boolean;
}

export class InviteStaffDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(ClinicRole)
  role: ClinicRole;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];
}