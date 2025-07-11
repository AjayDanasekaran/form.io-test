import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FormDraftDocument = FormDraft & Document;

@Schema({ timestamps: true })
export class FormDraft {
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
  savedBy: string;

  @Prop({ required: true })
  savedAt: Date;

  @Prop({ type: Object, required: true })
  draftData: Record<string, any>;
}

export const FormDraftSchema = SchemaFactory.createForClass(FormDraft); 