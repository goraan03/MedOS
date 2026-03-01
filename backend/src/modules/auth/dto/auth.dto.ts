import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ClinicRegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  pib?: string;

  @IsBoolean()
  @IsOptional()
  isPolyclinic?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  modules?: string[];
}

export class OwnerRegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class RegisterDto {
  @ValidateNested()
  @Type(() => ClinicRegisterDto)
  clinic: ClinicRegisterDto;

  @ValidateNested()
  @Type(() => OwnerRegisterDto)
  owner: OwnerRegisterDto;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  clinicSlug: string;
}
