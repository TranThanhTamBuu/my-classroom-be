import { Classes } from './classes.entity';
import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Users } from 'src/auth/users.entity';
import { CodeGenerate } from 'src/Utils/CodeGenerate';

@Module({
  imports: [TypeOrmModule.forFeature([Classes, Users]), AuthModule, CodeGenerate],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
