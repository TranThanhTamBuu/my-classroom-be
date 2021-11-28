import { CreateClassDto } from './dto/create-class.dto';
import { Controller, Post, Get, Body, UseGuards, Req, NotAcceptableException, Param, Put } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { AuthGuard } from '@nestjs/passport';
import { SetGradeListDto } from './dto/set-gradeList.dto';
import { SetListStudentDto} from './dto/set-list-student.dto'

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


  // dùng để import danh sách ban đầu:
  @Put('studentList')
  async setStudentList(@Req() req, @Body() setListStudentDto: SetListStudentDto) {
    const { user } = req;
    return this.classesService.setListStudent(user, setListStudentDto);
  }
}
