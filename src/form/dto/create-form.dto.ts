import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFormFieldDto {
  @IsString()
  fieldId: string;

  @IsString()
  label: string;

  @IsString()
  type: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsBoolean()
  @IsOptional()
  prepopulateFromPrevious?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}

export class CreateFormDto {
  @IsString()
  formId: string;

  @IsNumber()
  @IsOptional()
  version?: number;

  @IsString()
  name: string;

  @IsString()
  context: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  createdBy: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormFieldDto)
  fields: CreateFormFieldDto[];
} 