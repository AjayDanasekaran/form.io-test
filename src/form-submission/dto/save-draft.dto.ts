import { IsString, IsObject, IsOptional } from 'class-validator';

export class SaveDraftDto {
  @IsString()
  formId: string;

  @IsString()
  centerId: string;

  @IsString()
  savedBy: string;

  @IsString()
  @IsOptional()
  guestId?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsObject()
  draftData: Record<string, any>;
} 