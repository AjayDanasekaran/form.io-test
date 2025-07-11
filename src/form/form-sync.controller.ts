import { Controller, Post, Param, Get, Logger } from '@nestjs/common';
import { FormIoService } from './form-io.service';

@Controller('form-sync')
export class FormSyncController {
  private readonly logger = new Logger(FormSyncController.name);

  constructor(private readonly formIoService: FormIoService) {}

  /**
   * Sync a specific form from Form.io to local database
   */
  @Post('from-formio/:formId')
  async syncFormFromFormIo(@Param('formId') formId: string) {
    this.logger.log(`Manual sync requested for form: ${formId}`);
    
    try {
      await this.formIoService.syncFormFromFormIo(formId);
      return { 
        success: true, 
        message: `Form ${formId} synced from Form.io successfully` 
      };
    } catch (error) {
      this.logger.error(`Failed to sync form ${formId}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync all forms from Form.io to local database
   */
  @Post('all-from-formio')
  async syncAllFormsFromFormIo() {
    this.logger.log('Manual sync all forms from Form.io requested');
    
    try {
      await this.formIoService.syncAllFormsFromFormIo();
      return { 
        success: true, 
        message: 'All forms synced from Form.io successfully' 
      };
    } catch (error) {
      this.logger.error('Failed to sync all forms from Form.io:', error.message);
      throw error;
    }
  }

  /**
   * Get sync status - check which forms exist in Form.io vs local database
   */
  @Get('status')
  async getSyncStatus() {
    this.logger.log('Sync status check requested');
    
    try {
      return this.formIoService.getFormSyncStatus();
    } catch (error) {
      this.logger.error('Failed to get sync status:', error.message);
      throw error;
    }
  }
} 