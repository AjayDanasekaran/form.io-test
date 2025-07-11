import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FormAssignmentDocument = FormAssignment & Document;

@Schema({ timestamps: true })
export class FormAssignment {
  @Prop({ required: true })
  formId: string;

  @Prop({ required: true })
  context: string;

  @Prop({ default: null })
  serviceId?: string;

  @Prop({ default: null })
  centerId?: string;
}

export const FormAssignmentSchema = SchemaFactory.createForClass(FormAssignment); 