import { Module } from '@nestjs/common';
import { ClassesModule } from './classes/classes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classes } from './classes/classes.entity';
import { AuthModule } from './auth/auth.module';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Users } from './auth/users.entity';
import { LinkModule } from './link/link.module';
import { Link } from './link/link.entity';
import { AssignmentsModule } from './assignment/assignment.module';
import { Assignments } from './assignment/assignment.entity';
import { NotificationModule } from './notification/notification.module';
import { Notification } from './notification/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_URL,
      synchronize: true,
      useUnifiedTopology: true,
      entities: [Classes, Users, Link, Assignments, Notification],
    }),
    TypeOrmModule.forFeature([Classes, Users, Notification]),
    ClassesModule,
    AuthModule,
    LinkModule,
    AssignmentsModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
