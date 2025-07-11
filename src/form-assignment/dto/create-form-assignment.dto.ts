import { IsString, IsOptional } from 'class-validator';

export class CreateFormAssignmentDto {
  @IsString()
  formId: string;

  @IsString()
  context: string;

  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  centerId?: string;
} 