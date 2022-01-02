import { CreateClassDto } from './dto/create-class.dto';
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  NotAcceptableException,
  Param,
  Put,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { AuthGuard } from '@nestjs/passport';
import { SetGradeListDto } from './dto/set-gradeList.dto';
import { SetListStudentDto } from './dto/set-list-student.dto';
import { Classes } from './classes.entity';
import { ToggleActiveDto } from './dto/toggle-active-dto';

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
    if (user.studentId)
      throw new NotAcceptableException(
        'Student is not allowed to create class',
      );
    return await this.classesService.createClass(createClassDto, user);
  }

  @Get('/all')
  async getAllClasses(@Req() req): Promise<Classes[]> {
    if (req.user.isAdmin) return this.classesService.getAllClasses();
    else throw new ForbiddenException();
  }

  @Get('/:id')
  async getClassDetail(@Param('id') id: string) {
    return this.classesService.getClassDetail(id);
  }

  @Put('/studentList')
  async setStudentList(
    @Req() req,
    @Body() setListStudentDto: SetListStudentDto,
  ) {
    const { user } = req;
    return this.classesService.setListStudent(user, setListStudentDto);
  }

  @Post('/toggle-active')
  @UseGuards(AuthGuard())
  async toggleActive(
    @Req() req,
    @Body() toggleActiveDto: ToggleActiveDto,
  ): Promise<Classes[]> {
    if (req.user.isAdmin)
      return this.classesService.toggleActiveClasses(toggleActiveDto);
    else throw new ForbiddenException();
  }

  @Get('/regen-enterCode')
  async regenEnterCode() {
    const isSuccess = await this.classesService.reGenEnterCodeForAll();
    return {
      isSuccess: isSuccess
    };
  }

  @Put('/enter-class/:code')
  async joinClassByCode(@Req() req, @Param('code') code: string): Promise<any> {
    const { user } = req;
    const data = await this.classesService.joinClassByCode(user, code);
    Promise.resolve(data);
  }
}
