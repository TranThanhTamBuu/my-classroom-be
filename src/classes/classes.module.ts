import { Classes } from './classes.entity';
import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { StringArraryUtils } from 'src/Utils/StringArrayInclude';

@Module({
  imports: [TypeOrmModule.forFeature([Classes]), AuthModule, StringArraryUtils],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
