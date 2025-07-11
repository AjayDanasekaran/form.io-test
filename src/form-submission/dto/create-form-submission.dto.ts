import { IsString, IsNumber, IsDate, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFormSubmissionDto {
  @IsString()
  submissionId: string;

  @IsString()
  formId: string;

  @IsNumber()
  version: number;

  @IsString()
  @IsOptional()
  guestId?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  centerId: string;

  @IsDate()
  @Type(() => Date)
  submittedAt: Date;

  @IsString()
  submittedBy: string;

  @IsObject()
  data: Record<string, any>;
} 