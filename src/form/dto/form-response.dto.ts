import { IsString, IsObject, IsOptional } from 'class-validator';

export class FormResponseDto {
  @IsString()
  formId: string;

  @IsString()
  name: string;

  @IsString()
  context: string;

  @IsObject()
  schema: any; // Form.io JSON schema

  @IsObject()
  @IsOptional()
  prepopulateData?: Record<string, any>;

  @IsObject()
  @IsOptional()
  draftData?: Record<string, any>;

  @IsString()
  formUrl: string;
} 