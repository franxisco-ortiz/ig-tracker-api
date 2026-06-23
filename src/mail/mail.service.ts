import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('GMAIL_USER'),
        pass: this.config.get<string>('GMAIL_PASSWORD'),
      },
    });
  }

  async sendUnfollowAlert(usernames: string[]): Promise<void> {
    const to = this.config.get<string>('NOTIFY_EMAIL');
    if (!to) {
      this.logger.warn('NOTIFY_EMAIL no configurado, no se envía email');
      return;
    }

    await this.transporter.sendMail({
      from: this.config.get<string>('GMAIL_USER'),
      to,
      subject: `Instagram: ${usernames.length} usuario(s) dejaron de seguirte`,
      text: usernames.join('\n'),
    });
  }
}
