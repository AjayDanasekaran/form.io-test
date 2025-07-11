import { Module } from '@nestjs/common';
import { FormFlowController } from './form-flow.controller';
import { FormFlowService } from './form-flow.service';
import { FormModule } from '../form/form.module';
import { FormAssignmentModule } from '../form-assignment/form-assignment.module';
import { FormSubmissionModule } from '../form-submission/form-submission.module';

@Module({
  imports: [FormModule, FormAssignmentModule, FormSubmissionModule],
  controllers: [FormFlowController],
  providers: [FormFlowService],
  exports: [FormFlowService],
})
export class FormFlowModule {} 