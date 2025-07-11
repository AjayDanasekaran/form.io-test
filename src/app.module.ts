import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { FormModule } from './form/form.module';
import { FormAssignmentModule } from './form-assignment/form-assignment.module';
import { FormSubmissionModule } from './form-submission/form-submission.module';
import { FormFlowModule } from './form-flow/form-flow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/form-poc'),
    ScheduleModule.forRoot(),
    FormModule,
    FormAssignmentModule,
    FormSubmissionModule,
    FormFlowModule,
  ],
})
export class AppModule {} 