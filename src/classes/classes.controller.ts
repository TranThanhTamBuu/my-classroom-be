import { CreateClassDto } from './dto/create-class.dto';
import { Controller, Post, Get, Body } from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller('classes')
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Get()
  async getClasses() {
    return this.classesService.getClasses();
  }

  @Post()
  async createClass(@Body() createClassDto: CreateClassDto) {
    return await this.classesService.createClass(createClassDto);
  }
}
