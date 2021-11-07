import { CreateClassDto } from './dto/create-class.dto';
import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('classes')
@UseGuards(AuthGuard())
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Get()
  async getClasses(@Req() req) {
    const { user } = req;
    if (!user.studentId) return this.classesService.getTeacherClasses(user);
    else return this.classesService.getStudentClasses(user);
  }

  @Post()
  async createClass(@Req() req, @Body() createClassDto: CreateClassDto) {
    const { user } = req;
    return await this.classesService.createClass(createClassDto, user);
  }
}
