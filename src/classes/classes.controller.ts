import { CreateClassDto } from './dto/create-class.dto';
import { Controller, Post, Get, Body, UseGuards, Req, NotAcceptableException, Param, Put } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { AuthGuard } from '@nestjs/passport';
import { SetGradeListDto } from './dto/set-gradeList.dto';

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
    if (user.studentId) throw new NotAcceptableException('Student is not allowed to create class');
    return await this.classesService.createClass(createClassDto, user);
  }

  @Get('/:id')
  async getClassDetail(@Param('id') id: string) {
    return this.classesService.getClassDetail(id);
  }

  @Get('gradeList/:id')
  async getClassGradeList(@Req() req, @Param('id') id: string) {
    const { user } = req;
    return this.classesService.getClassGradeList(id, user);
  }

  @Put('gradeList')
  async setClassGradeList(@Req() req, @Body() setGradeListDto: SetGradeListDto) {
    const { user } = req;
    return this.classesService.setClassGradeList(user, setGradeListDto);
  }
}
