import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';

@Controller('forms')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post()
  create(@Body() createFormDto: CreateFormDto) {
    return this.formService.create(createFormDto);
  }

  @Get()
  findAll() {
    return this.formService.findAll();
  }

  @Get('context/:context')
  findByContext(@Param('context') context: string) {
    return this.formService.findActiveByContext(context);
  }

  @Get(':formId')
  findById(@Param('formId') formId: string) {
    return this.formService.findById(formId);
  }

  @Get(':formId/url')
  getFormUrl(@Param('formId') formId: string) {
    return this.formService.getFormUrl(formId);
  }

  @Post(':formId/version')
  createNewVersion(
    @Param('formId') formId: string,
    @Body() createFormDto: CreateFormDto,
  ) {
    return this.formService.createNewVersion(formId, createFormDto);
  }
} 