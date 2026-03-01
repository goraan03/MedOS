import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsOptional()
  patientId?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsDateString()
  @IsOptional()
  paidAt?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class GetPaymentsDto {
  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
