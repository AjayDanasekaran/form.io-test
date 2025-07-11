import { Injectable } from '@nestjs/common';
import { FormField } from './schemas/form.schema';

@Injectable()
export class FormSchemaService {
  convertToFormIoSchema(fields: FormField[]): any {
    console.log('fields', fields);
    const components = fields.map((field, index) => {
      const component = {
        type: this.mapFieldType(field.type),
        key: field.fieldId,
        label: field.label,
        input: true,
        weight: index * 10,
        validate: {
          required: field.required,
        },
      };

      // Add field-specific properties
      switch (field.type) {
        case 'email':
          component['inputType'] = 'email';
          break;
        case 'tel':
          component['inputType'] = 'tel';
          break;
        case 'date':
          component['inputType'] = 'date';
          break;
        case 'dropdown':
          component['data'] = {
            values: field.options?.map((option, i) => ({
              label: option,
              value: option,
            })) || [],
          };
          break;
        case 'radio':
          component['values'] = field.options?.map((option, i) => ({
            label: option,
            value: option,
          })) || [];
          break;
        case 'checkbox':
          component['type'] = 'checkbox';
          break;
        case 'textarea':
          component['type'] = 'textarea';
          break;
      }

      return component;
    });

    return components;
  }

  private mapFieldType(type: string): string {
    const typeMap: Record<string, string> = {
      text: 'textfield',
      email: 'textfield',
      tel: 'textfield',
      date: 'textfield',
      dropdown: 'select',
      radio: 'radio',
      checkbox: 'checkbox',
      textarea: 'textarea',
    };

    return typeMap[type] || 'textfield';
  }

  // Convert Form.io schema back to our format (if needed)
  convertFromFormIoSchema(formIoSchema: any): FormField[] {
    if (!formIoSchema.components) {
      return [];
    }

    return formIoSchema.components.map((component: any) => {
      const field: FormField = {
        fieldId: component.key,
        label: component.label,
        type: this.mapFromFormIoType(component.type, component.inputType),
        required: component.validate?.required || false,
        prepopulateFromPrevious: false, // Default value
      };

      // Handle options for dropdown/radio
      if (component.data?.values) {
        field.options = component.data.values.map((v: any) => v.label);
      } else if (component.values) {
        field.options = component.values.map((v: any) => v.label);
      }

      return field;
    });
  }

  private mapFromFormIoType(type: string, inputType?: string): string {
    if (inputType) {
      return inputType;
    }

    const typeMap: Record<string, string> = {
      textfield: 'text',
      select: 'dropdown',
      radio: 'radio',
      checkbox: 'checkbox',
      textarea: 'textarea',
    };

    return typeMap[type] || 'text';
  }
} 