import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FormSubmissionDocument = FormSubmission & Document;

@Schema({ timestamps: true })
export class FormSubmission {
  @Prop({ required: true, unique: true })
  submissionId: string;

  @Prop({ required: true })
  formId: string;

  @Prop({ required: true })
  version: number;

  @Prop({ default: null })
  guestId?: string;

  @Prop({ default: null })
  appointmentId?: string;

  @Prop({ required: true })
  centerId: string;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop({ required: true })
  submittedBy: string;

  @Prop({ type: Object, required: true })
  data: Record<string, any>;

  @Prop({ type: Object })
  raw?: any;
}

export const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission); 