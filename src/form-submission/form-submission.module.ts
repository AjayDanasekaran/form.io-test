import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSubmissionController } from './form-submission.controller';
import { FormSubmissionService } from './form-submission.service';
import { FormSubmission, FormSubmissionSchema } from './schemas/form-submission.schema';
import { FormDraft, FormDraftSchema } from './schemas/form-draft.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormSubmission.name, schema: FormSubmissionSchema },
      { name: FormDraft.name, schema: FormDraftSchema },
    ]),
  ],
  controllers: [FormSubmissionController],
  providers: [FormSubmissionService],
  exports: [FormSubmissionService],
})
export class FormSubmissionModule {} 