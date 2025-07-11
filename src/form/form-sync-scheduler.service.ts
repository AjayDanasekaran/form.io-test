import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FormIoService } from './form-io.service';

@Injectable()
export class FormSyncSchedulerService {
  private readonly logger = new Logger(FormSyncSchedulerService.name);

  constructor(private readonly formIoService: FormIoService) {}

  /**
   * Sync all forms from Form.io every hour
   * This ensures any forms created in Form.io are available in the local database
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncFormsFromFormIo() {
    this.logger.log('Starting scheduled sync from Form.io');
    
    try {
      await this.formIoService.syncAllFormsFromFormIo();
      this.logger.log('Scheduled sync from Form.io completed successfully');
    } catch (error) {
      this.logger.error('Scheduled sync from Form.io failed:', error.message);
    }
  }

  /**
   * Daily sync status check
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailySyncStatusCheck() {
    this.logger.log('Starting daily sync status check');
    
    try {
      await this.formIoService.getFormSyncStatus();
      this.logger.log('Daily sync status check completed');
    } catch (error) {
      this.logger.error('Daily sync status check failed:', error.message);
    }
  }
} 