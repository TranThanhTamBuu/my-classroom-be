import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { LinkController } from './link.controller';
import { Link } from './link.entity';
import { LinkService } from './link.service';
import { ClassesModule } from 'src/classes/classes.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Link]),
    AuthModule,
    ClassesModule,
    MailModule,
  ],
  controllers: [LinkController],
  providers: [LinkService],
})
export class LinkModule {}
