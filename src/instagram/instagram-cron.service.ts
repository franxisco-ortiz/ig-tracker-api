import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InstagramService } from './instagram.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InstagramCronService {
  private readonly logger = new Logger(InstagramCronService.name);

  constructor(
    private readonly instagramService: InstagramService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySync(): Promise<void> {
    this.logger.log('Ejecutando sync diario de Instagram');
    const result = await this.instagramService.sync();

    if (result.newUnfollows.length > 0) {
      await this.mailService.sendUnfollowAlert(result.newUnfollows);
    }
  }
}
