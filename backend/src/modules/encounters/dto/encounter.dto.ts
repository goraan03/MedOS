import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';

export enum EncounterVisibility {
  STAFF_ONLY = 'STAFF_ONLY',
  PATIENT_VISIBLE = 'PATIENT_VISIBLE',
}

export class CreateEncounterDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsNotEmpty()
  moduleKey: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(EncounterVisibility)
  @IsOptional()
  visibility?: EncounterVisibility;

  @IsObject()
  @IsOptional()
  extraData?: Record<string, unknown>;
}

export class UpdateEncounterDto {
  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(EncounterVisibility)
  @IsOptional()
  visibility?: EncounterVisibility;

  @IsObject()
  @IsOptional()
  extraData?: Record<string, unknown>;
}

export class GetEncountersDto {
  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  moduleKey?: string;
}
