import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from './schemas/form.schema';
import { CreateFormDto } from './dto/create-form.dto';
import { FormIoService } from './form-io.service';

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(
    @InjectModel(Form.name) private formModel: Model<FormDocument>,
    @Inject(forwardRef(() => FormIoService))
    private readonly formIoService: FormIoService,
  ) {}

  async findAllIds(): Promise<{ formId: string }[]> {
    return this.formModel.find({}, { formId: 1, _id: 0 }).exec();
  }

  async create(createFormDto: CreateFormDto): Promise<Form> {
    const createdForm = new this.formModel(createFormDto);
    const savedForm = await createdForm.save();
    
    // Note: No sync to Form.io - forms should only be created in Form.io
    this.logger.log(`Form ${savedForm.formId} created in local database`);
    
    return savedForm;
  }

  async findAll(): Promise<Form[]> {
    return this.formModel.find().exec();
  }

  async findActiveByContext(context: string): Promise<Form[]> {
    return this.formModel.find({ context, isActive: true }).exec();
  }

  async findById(formId: string): Promise<Form> {
    return this.formModel.findOne({ formId, isActive: true }).exec();
  }

  async createNewVersion(formId: string, createFormDto: CreateFormDto): Promise<Form> {
    // Get the latest version
    const latestForm = await this.formModel
      .findOne({ formId })
      .sort({ version: -1 })
      .exec();

    const newVersion = latestForm ? latestForm.version + 1 : 1;
    
    // Deactivate previous version
    if (latestForm) {
      await this.formModel.updateOne(
        { _id: latestForm._id },
        { isActive: false }
      );
    }

    // Create new version
    const newForm = new this.formModel({
      ...createFormDto,
      formId,
      version: newVersion,
      isActive: true,
    });

    const savedForm = await newForm.save();
    
    // Note: No sync to Form.io - forms should only be created in Form.io
    this.logger.log(`Form ${savedForm.formId} v${savedForm.version} created in local database`);
    
    return savedForm;
  }

  async getFormUrl(formId: string): Promise<string> {
    const form = await this.findById(formId);
    if (!form) {
      throw new Error('Form not found');
    }
    
    // This would be your Form.io domain
    const formIoDomain = process.env.FORM_IO_DOMAIN || 'https://your-form-io-domain.com';
    return `${formIoDomain}/${form.name}`;
  }
} 