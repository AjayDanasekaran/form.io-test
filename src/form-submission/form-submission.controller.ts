import { Controller, Get, Post, Body, Param, Query, Delete } from '@nestjs/common';
import { FormSubmissionService } from './form-submission.service';
import { CreateFormSubmissionDto } from './dto/create-form-submission.dto';
import { SaveDraftDto } from './dto/save-draft.dto';

@Controller('form-submissions')
export class FormSubmissionController {
  constructor(private readonly formSubmissionService: FormSubmissionService) {}

  @Post('raw')
  async acceptRawSubmission(@Body() body: any) {
    return this.formSubmissionService.storeRawSubmission(body);
  }

  @Post()
  create(@Body() createFormSubmissionDto: CreateFormSubmissionDto) {
    return this.formSubmissionService.create(createFormSubmissionDto);
  }

  @Get('form/:formId')
  findByFormId(@Param('formId') formId: string) {
    return this.formSubmissionService.findByFormId(formId);
  }

  @Get('guest/:guestId')
  findByGuestId(@Param('guestId') guestId: string) {
    return this.formSubmissionService.findByGuestId(guestId);
  }

  @Get('appointment/:appointmentId')
  findByAppointmentId(@Param('appointmentId') appointmentId: string) {
    return this.formSubmissionService.findByAppointmentId(appointmentId);
  }

  @Get('prepopulate/:formId')
  getPrepopulateData(
    @Param('formId') formId: string,
    @Query('guestId') guestId?: string,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.formSubmissionService.getPrepopulateData(formId, guestId, appointmentId);
  }

  @Get('history/:formId')
  getSubmissionHistory(
    @Param('formId') formId: string,
    @Query('guestId') guestId?: string,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.formSubmissionService.getSubmissionHistory(formId, guestId, appointmentId);
  }

  @Get(':submissionId')
  getSubmissionById(@Param('submissionId') submissionId: string) {
    return this.formSubmissionService.getSubmissionById(submissionId);
  }

  // Draft endpoints
  @Post('draft')
  saveDraft(@Body() saveDraftDto: SaveDraftDto) {
    return this.formSubmissionService.saveDraft(saveDraftDto);
  }

  @Get('draft/:formId')
  getDraft(
    @Param('formId') formId: string,
    @Query('guestId') guestId?: string,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.formSubmissionService.getDraft(formId, guestId, appointmentId);
  }

  @Delete('draft/:formId')
  deleteDraft(
    @Param('formId') formId: string,
    @Query('guestId') guestId?: string,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.formSubmissionService.deleteDraft(formId, guestId, appointmentId);
  }

  @Get('data/:formId')
  getFormData(
    @Param('formId') formId: string,
    @Query('guestId') guestId?: string,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.formSubmissionService.getFormData(formId, guestId, appointmentId);
  }
} 