import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FormDocument = Form & Document;

@Schema({ timestamps: true })
export class FormField {
  @Prop({ required: true })
  fieldId: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: false })
  required: boolean;

  @Prop({ default: false })
  prepopulateFromPrevious: boolean;

  @Prop({ type: [String], default: [] })
  options?: string[];
}

@Schema({ timestamps: true })
export class Form {
  @Prop({ required: true, unique: true })
  formId: string;

  @Prop({ required: true, default: 1 })
  version: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  context: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ type: [FormField], required: true })
  fields: FormField[];
}

export const FormSchema = SchemaFactory.createForClass(Form); 