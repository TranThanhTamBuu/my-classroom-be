import { Assignments } from 'src/assignment/assignment.entity';
import { Module } from '@nestjs/common';
import { AssignmentsController } from 'src/assignment/assignment.controller';
import { AssignmentsService } from './assignment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ClassesModule } from 'src/classes/classes.module';
import {NotificationModule} from 'src/notification/notification.module';

@Module({
    imports: [TypeOrmModule.forFeature([Assignments]), AuthModule, ClassesModule, NotificationModule],
    controllers: [AssignmentsController],
    providers: [AssignmentsService]
})
export class AssignmentsModule { }
