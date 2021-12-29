import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import MailService from './mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private mailService: MailService,
  ) {}

  @Get()
  migrate() {
    return this.appService.migrate();
  }

  @Get('test-mail')
  testMail(): void {
    this.mailService.sendTestMail();
  }
}
