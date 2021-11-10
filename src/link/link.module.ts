import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { LinkController } from './link.controller';
import {Link} from './link.entity'
import { LinkService } from './link.service';
import { ClassesModule } from 'src/classes/classes.module';
import { StringArraryUtils } from 'src/Utils/StringArrayInclude';
import MailService from 'src/mail/mail.service';

@Module({
    imports: [TypeOrmModule.forFeature([Link]), AuthModule, ClassesModule, StringArraryUtils],
    controllers: [LinkController],
    providers: [LinkService, MailService],
})
export class LinkModule {}
