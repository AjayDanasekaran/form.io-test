import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { FormFlowService } from './form-flow.service';

@Controller('form-flow')
export class FormFlowController {
  constructor(private readonly formFlowService: FormFlowService) {}
  
  /*
  Needed : FE can request for form using this api
  */
  @Get('assignments')
  async getFormAssignments(
    @Query('context') context: string,
    @Query('serviceId') serviceId?: string,
    @Query('centerId') centerId?: string,
  ) {
    return this.formFlowService.getFormAssignments(context, serviceId, centerId);
  }

  /*
  Needed : can use this api to get particular form with prepopulate data
  */
  @Get('form/:formId')
  async getFormWithPrepopulate(
    @Param('formId') formId: string,
    @Query('guestId') guestId?: string,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.formFlowService.getFormWithPrepopulate(formId, guestId, appointmentId);
  }

  @Get('complete/:formId')
  async getCompleteForm(
    @Param('formId') formId: string,
    @Query('guestId') guestId?: string,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.formFlowService.getCompleteForm(formId, guestId, appointmentId);
  }
} 