import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import MailService from './mail.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
