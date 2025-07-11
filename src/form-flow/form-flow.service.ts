import { Injectable } from '@nestjs/common';
import { FormService } from '../form/form.service';
import { FormAssignmentService } from '../form-assignment/form-assignment.service';
import { FormSubmissionService } from '../form-submission/form-submission.service';
import { FormSchemaService } from '../form/form-schema.service';

export interface FormFlowResponse {
  formId: string;
  formUrl: string;
  name: string;
  context: string;
  schema: any; // Form.io JSON schema
  prepopulateData: Record<string, any>;
  draftData?: Record<string, any>;
}

@Injectable()
export class FormFlowService {
  constructor(
    private readonly formService: FormService,
    private readonly formAssignmentService: FormAssignmentService,
    private readonly formSubmissionService: FormSubmissionService,
    private readonly formSchemaService: FormSchemaService,
  ) {}

  async getFormAssignments(
    context: string,
    serviceId?: string,
    centerId?: string,
  ): Promise<FormFlowResponse[]> {
    // 1. Get form assignments with fallback logic
    const assignments = await this.formAssignmentService.getFormAssignments(
      context,
      serviceId,
      centerId,
    );

    const formFlowResponses: FormFlowResponse[] = [];

    // 2. For each assignment, get the form details and prepopulate data
    for (const assignment of assignments) {
      const form = await this.formService.findById(assignment.formId);
      if (!form) continue;

      const formUrl = await this.formService.getFormUrl(assignment.formId);
      
      // 3. Get prepopulate data based on context
      let prepopulateData = {};
      if (context === 'guest_form') {
        // For guest forms, we might have guestId in the future
        // For now, we'll get the most recent submission for this form
        prepopulateData = await this.formSubmissionService.getPrepopulateData(
          assignment.formId,
        );
      } else if (context === 'service_form') {
        // For service forms, we might have appointmentId
        // For now, we'll get the most recent submission for this form
        prepopulateData = await this.formSubmissionService.getPrepopulateData(
          assignment.formId,
        );
      }

      formFlowResponses.push({
        formId: assignment.formId,
        formUrl,
        name: form.name,
        context: form.context,
        schema: this.formSchemaService.convertToFormIoSchema(form.fields),
        prepopulateData,
        draftData: undefined, // Will be populated if needed
      });
    }

    return formFlowResponses;
  }

  async getFormWithPrepopulate(
    formId: string,
    guestId?: string,
    appointmentId?: string,
  ): Promise<FormFlowResponse> {
    // 1. Get the form
    const form = await this.formService.findById(formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // 2. Get the form URL
    const formUrl = await this.formService.getFormUrl(formId);

    // 3. Get prepopulate data and draft data
    const { prepopulateData, draftData } = await this.formSubmissionService.getFormData(
      formId,
      guestId,
      appointmentId,
    );

    return {
      formId,
      formUrl,
      name: form.name,
      context: form.context,
      schema: this.formSchemaService.convertToFormIoSchema(form.fields),
      prepopulateData,
      draftData,
    };
  }

  async getCompleteForm(
    formId: string,
    guestId?: string,
    appointmentId?: string,
  ): Promise<FormFlowResponse> {
    // This method returns the complete form with schema and all data
    return this.getFormWithPrepopulate(formId, guestId, appointmentId);
  }
} 