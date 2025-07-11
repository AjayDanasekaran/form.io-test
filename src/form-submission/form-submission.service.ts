import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormSubmission, FormSubmissionDocument } from './schemas/form-submission.schema';
import { FormDraft, FormDraftDocument } from './schemas/form-draft.schema';
import { CreateFormSubmissionDto } from './dto/create-form-submission.dto';
import { SaveDraftDto } from './dto/save-draft.dto';

@Injectable()
export class FormSubmissionService {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
    @InjectModel(FormDraft.name) private formDraftModel: Model<FormDraftDocument>,
  ) {}

  async storeRawSubmission(body: any): Promise<FormSubmission> {
    const submission = new this.formSubmissionModel({
      submissionId: body?._id || 'temp-id',
      formId: body?.form || 'temp-form',
      version: 1, // default or determine dynamically later
      guestId: body.data?.guestId || null,
      appointmentId: body.data?.appointmentId || null,
      centerId: body.data?.centerId || 'UNKNOWN',
      submittedAt: body.created ? new Date(body.created) : new Date(),
      submittedBy: body.owner || 'form_io_sync',
      data: body.data,
      raw: body, // full original payload
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  
    return await submission.save();
  }
  

  async create(createFormSubmissionDto: CreateFormSubmissionDto): Promise<FormSubmission> {
    const createdSubmission = new this.formSubmissionModel(createFormSubmissionDto);
    return createdSubmission.save();
  }

  async findByFormId(formId: string): Promise<FormSubmission[]> {
    return this.formSubmissionModel.find({ formId }).exec();
  }

  async findByGuestId(guestId: string): Promise<FormSubmission[]> {
    return this.formSubmissionModel.find({ guestId }).exec();
  }

  async findByAppointmentId(appointmentId: string): Promise<FormSubmission[]> {
    return this.formSubmissionModel.find({ appointmentId }).exec();
  }

  async getPrepopulateData(formId: string, guestId?: string, appointmentId?: string): Promise<Record<string, any>> {
    const query: any = { formId };
    
    if (guestId) {
      query.guestId = guestId;
    } else if (appointmentId) {
      query.appointmentId = appointmentId;
    }

    // Get the most recent submission for prepopulation
    const latestSubmission = await this.formSubmissionModel
      .findOne(query)
      .sort({ submittedAt: -1 })
      .exec();

    return latestSubmission ? latestSubmission.data : {};
  }

  async getSubmissionHistory(formId: string, guestId?: string, appointmentId?: string): Promise<FormSubmission[]> {
    const query: any = { formId };
    
    if (guestId) {
      query.guestId = guestId;
    } else if (appointmentId) {
      query.appointmentId = appointmentId;
    }

    return this.formSubmissionModel
      .find(query)
      .sort({ submittedAt: -1 })
      .exec();
  }

  async getSubmissionById(submissionId: string): Promise<FormSubmission> {
    return this.formSubmissionModel.findOne({ submissionId }).exec();
  }

  // Draft methods
  async saveDraft(saveDraftDto: SaveDraftDto): Promise<FormDraft> {
    // Check if draft already exists
    const existingDraft = await this.formDraftModel.findOne({
      formId: saveDraftDto.formId,
      guestId: saveDraftDto.guestId,
      appointmentId: saveDraftDto.appointmentId,
    }).exec();

    if (existingDraft) {
      // Update existing draft
      return this.formDraftModel.findByIdAndUpdate(
        existingDraft._id,
        {
          draftData: saveDraftDto.draftData,
          savedAt: new Date(),
          savedBy: saveDraftDto.savedBy,
        },
        { new: true }
      ).exec();
    } else {
      // Create new draft
      const newDraft = new this.formDraftModel({
        ...saveDraftDto,
        savedAt: new Date(),
        version: 1, // You might want to get this from the form service
      });
      return newDraft.save();
    }
  }

  async getDraft(formId: string, guestId?: string, appointmentId?: string): Promise<FormDraft> {
    const query: any = { formId };
    
    if (guestId) {
      query.guestId = guestId;
    } else if (appointmentId) {
      query.appointmentId = appointmentId;
    }

    return this.formDraftModel.findOne(query).exec();
  }

  async deleteDraft(formId: string, guestId?: string, appointmentId?: string): Promise<void> {
    const query: any = { formId };
    
    if (guestId) {
      query.guestId = guestId;
    } else if (appointmentId) {
      query.appointmentId = appointmentId;
    }

    await this.formDraftModel.deleteOne(query).exec();
  }

  async getFormData(formId: string, guestId?: string, appointmentId?: string): Promise<{
    prepopulateData: Record<string, any>;
    draftData?: Record<string, any>;
  }> {
    // Get prepopulate data from submissions
    const prepopulateData = await this.getPrepopulateData(formId, guestId, appointmentId);
    
    // Get draft data
    const draft = await this.getDraft(formId, guestId, appointmentId);
    const draftData = draft ? draft.draftData : undefined;

    return {
      prepopulateData,
      draftData,
    };
  }
} 