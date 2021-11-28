import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { LinkController } from './link.controller';
import {Link} from './link.entity'
import { LinkService } from './link.service';
import { ClassesModule } from 'src/classes/classes.module';
import MailService from 'src/mail/mail.service';

@Module({
    imports: [TypeOrmModule.forFeature([Link]), AuthModule, ClassesModule],
    controllers: [LinkController],
    providers: [LinkService, MailService],
})
export class LinkModule {}
