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

  @IsString()
  @IsOptional()
  pib?: string;

  @IsBoolean()
  @IsOptional()
  isPolyclinic?: boolean;

  @IsOptional()
  settings?: Record<string, unknown>;
}

export class UpdateModulesDto {
  @IsArray()
  @IsString({ each: true })
  modules: string[];
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
  allowedModules?: string[];
}
