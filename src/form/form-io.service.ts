import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { Form } from './schemas/form.schema';

export interface FormIoForm {
  _id: string;
  name: string;
  path: string;
  title: string;
  display: string;
  components: any[];
  settings: any;
  machineName: string;
  created: string;
  modified: string;
}

@Injectable()
export class FormIoService {
  private readonly logger = new Logger(FormIoService.name);
  private readonly formIoDomain: string;
  private readonly formIoApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => FormService))
    private readonly formService: FormService,
  ) {
    this.formIoDomain = this.configService.get<string>('FORM_IO_DOMAIN');
    this.formIoApiKey = this.configService.get<string>('FORM_IO_API_KEY');
  }
  
  /**
   * Sync a form from Form.io to local database
   */
  async syncFormFromFormIo(formId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.formIoDomain}/form/${formId}`, {
          headers: {
            'x-token': this.formIoApiKey,
          },
        })
      );

      const formIoForm: FormIoForm = response.data as FormIoForm;
      const createFormDto = this.convertFromFormIo(formIoForm);
      
      // Check if form exists in local database
      const existingForm = await this.formService.findById(formId);
      
      if (existingForm) {
        // Update existing form
        await this.formService.createNewVersion(formId, createFormDto);
        this.logger.log(`Form ${formId} updated from Form.io`);
      } else {
        // Create new form
        await this.formService.create(createFormDto);
        this.logger.log(`Form ${formId} created from Form.io`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync form ${formId} from Form.io:`, error.message);
      throw error;
    }
  }

  /**
   * Get all forms from Form.io and sync them to local database
   */
  async syncAllFormsFromFormIo(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.formIoDomain}/form`, {
          headers: {
            'x-token': this.formIoApiKey,
          },
        })
      );

      const forms: FormIoForm[] = response.data as FormIoForm[];
      
      for (const formIoForm of forms) {
        try {
          await this.syncFormFromFormIo(formIoForm._id);
        } catch (error) {
          this.logger.error(`Failed to sync form ${formIoForm._id}:`, error.message);
        }
      }

      this.logger.log(`Synced ${forms.length} forms from Form.io`);
    } catch (error) {
      this.logger.error('Failed to sync all forms from Form.io:', error.message);
      throw error;
    }
  }

  async getFormSyncStatus(): Promise<{
    totalFormIoForms: number;
    totalLocalForms: number;
    missingInLocal: string[];
    extraInLocal: string[];
  }> {
    const formIoResponse = await firstValueFrom(
      this.httpService.get(`${this.formIoDomain}/form`, {
        headers: { 'x-token': this.formIoApiKey },
      })
    );
  
    const formIoForms = formIoResponse.data as FormIoForm[];
    const formIoIds = formIoForms.map((f) => f._id);
  
    const localForms = await this.formService.findAllIds();
    const localIds = localForms.map((f) => f.formId);
  
    const missingInLocal = formIoIds.filter((id) => !localIds.includes(id));
    const extraInLocal = localIds.filter((id) => !formIoIds.includes(id));
  
    return {
      totalFormIoForms: formIoIds.length,
      totalLocalForms: localIds.length,
      missingInLocal,
      extraInLocal,
    };
  }


  // export interface FormIoForm {
  //   _id: string;
  //   name: string;
  //   path: string;
  //   title: string;
  //   display: string;
  //   components: any[];
  //   settings: any;
  //   machineName: string;
  //   created: string;
  //   modified: string;
  // }
  /**
   * Convert Form.io form to local DTO
   */
  private convertFromFormIo(formIoForm: FormIoForm): CreateFormDto {
    return {
      formId: formIoForm._id,
      name: formIoForm.name,
      context: this.detectContext(formIoForm),
      version: 1,
      isActive: true,
      createdBy: 'form_io_sync', // Default creator for synced forms
      fields: formIoForm.components.map((component: any) => ({
        fieldId: component.key,
        label: component.label,
        type: this.mapFormIoType(component.type),
        required: component.validate?.required || false,
        options: this.extractOptions(component),
      })),
    };
  }

  /**
   * Map Form.io types to local types
   */
  private mapFormIoType(type: string): string {
    const typeMap: { [key: string]: string } = {
      textfield: 'text',
      select: 'dropdown',
      radio: 'radio',
      checkbox: 'checkbox',
      textarea: 'textarea',
    };
    return typeMap[type] || 'text';
  }

  /**
   * Get field-specific properties for Form.io
   */
  private getFieldSpecificProps(field: any): any {
    switch (field.type) {
      case 'email':
        return { inputType: 'email' };
      case 'tel':
        return { inputType: 'tel' };
      case 'date':
        return { inputType: 'date' };
      case 'dropdown':
        return {
          data: {
            values: field.options?.map((option: string) => ({
              label: option,
              value: option,
            })) || [],
          },
        };
      case 'radio':
        return {
          values: field.options?.map((option: string) => ({
            label: option,
            value: option,
          })) || [],
        };
      default:
        return {};
    }
  }

  /**
   * Extract options from Form.io component
   */
  private extractOptions(component: any): string[] {
    if (component.data?.values) {
      return component.data.values.map((item: any) => item.label || item.value);
    }
    if (component.values) {
      return component.values.map((item: any) => item.label || item.value);
    }
    return [];
  }

  /**
   * Detect form context based on Form.io form properties
   */
  private detectContext(formIoForm: FormIoForm): string {
    const name = formIoForm.name.toLowerCase();
    const path = formIoForm.path.toLowerCase();
    
    if (name.includes('guest') || path.includes('guest')) {
      return 'guest_form';
    }
    if (name.includes('service') || path.includes('service')) {
      return 'service_form';
    }
    if (name.includes('feedback') || path.includes('feedback')) {
      return 'feedback_form';
    }
    
    return 'service_form'; // default
  }
} 