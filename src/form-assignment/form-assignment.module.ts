import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormAssignmentController } from './form-assignment.controller';
import { FormAssignmentService } from './form-assignment.service';
import { FormAssignment, FormAssignmentSchema } from './schemas/form-assignment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FormAssignment.name, schema: FormAssignmentSchema }]),
  ],
  controllers: [FormAssignmentController],
  providers: [FormAssignmentService],
  exports: [FormAssignmentService],
})
export class FormAssignmentModule {} 