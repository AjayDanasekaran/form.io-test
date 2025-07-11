import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { FormController } from './form.controller';
import { FormSyncController } from './form-sync.controller';
import { FormService } from './form.service';
import { FormSchemaService } from './form-schema.service';
import { FormIoService } from './form-io.service';
import { FormSyncSchedulerService } from './form-sync-scheduler.service';
import { Form, FormSchema } from './schemas/form.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Form.name, schema: FormSchema }]),
    HttpModule,
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [FormController, FormSyncController],
  providers: [FormService, FormSchemaService, FormIoService, FormSyncSchedulerService],
  exports: [FormService, FormSchemaService, FormIoService],
})
export class FormModule {} 