import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { FormAssignmentService } from './form-assignment.service';
import { CreateFormAssignmentDto } from './dto/create-form-assignment.dto';

@Controller('form-assignments')
export class FormAssignmentController {
  constructor(private readonly formAssignmentService: FormAssignmentService) {}

  @Post()
  create(@Body() createFormAssignmentDto: CreateFormAssignmentDto) {
    return this.formAssignmentService.create(createFormAssignmentDto);
  }

  @Get()
  findAll() {
    return this.formAssignmentService.findAll();
  }

  @Get('resolve')
  async getFormAssignments(
    @Query('context') context: string,
    @Query('serviceId') serviceId?: string,
    @Query('centerId') centerId?: string,
  ) {
    return this.formAssignmentService.getFormAssignments(
      context,
      serviceId,
      centerId,
    );
  }
} 