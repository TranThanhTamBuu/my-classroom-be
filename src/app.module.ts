import { Module } from '@nestjs/common';
import { ClassesModule } from './classes/classes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classes } from './classes/classes.entity';
import { AuthModule } from './auth/auth.module';
import 'dotenv/config';
import { AppController } from './app.controller';
import MailService from './mail/mail.service';
import { AppService } from './app.service';
import { Users } from './auth/users.entity';
import { LinkModule } from './link/link.module';
import {Link} from './link/link.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_URL,
      synchronize: true,
      useUnifiedTopology: true,
      entities: [Classes, Users, Link],
    }),
    ClassesModule,
    AuthModule,
    LinkModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
