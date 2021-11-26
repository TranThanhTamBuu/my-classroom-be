import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classes } from './classes.entity';
import { Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { Users } from 'src/auth/users.entity';
import { AuthService } from 'src/auth/auth.service';
import { StringArraryUtils } from 'src/Utils/StringArrayInclude';
import { SetGradeListDto } from './dto/set-gradeList.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes) private classesRepository: Repository<Classes>,
    private authService: AuthService,
    private stringArrUtils: StringArraryUtils,
  ) {}

  async getTeacherClasses(teacher: Users): Promise<Classes[]> {
    return this.classesRepository.find({
      where: {
        $or: [
          { teachers: { $all: [teacher._id] } },
          { createdBy: teacher._id },
        ],
      },
    });
  }

  async getStudentClasses(student: Users): Promise<Classes[]> {
    return this.classesRepository.find({
      where: {
        students: { $all: [student.studentId] },
      },
    });
  }

  async createClass(
    createClassDto: CreateClassDto,
    creator: Users,
  ): Promise<Classes> {
    const { name, section, room, subject } = createClassDto;

    const newClass = this.classesRepository.create({
      name,
      section,
      room,
      subject,
      createdBy: creator._id,
      teachers: [creator._id],
      students:[],
    });

    return this.classesRepository.save(newClass);
  }

  async getAClass(classId: string): Promise<Classes>{
    return this.classesRepository.findOne(classId);
  }

  async saveAClass(aClass: Classes){
    return this.classesRepository.save(aClass);
  }

  async getClassDetail(classId: string): Promise<any>{
    const aClass = await this.classesRepository.findOne(classId);
    if (aClass == null) {
      throw new NotFoundException('Class id is not Found');
    }
    const listStudent = await this.authService.getListUserByStuId(aClass.students);
    const listTeacher = await this.authService.getListUser(aClass.teachers);
    return Promise.resolve({
      success: true,
      _id: aClass._id,
      name: aClass.name,
      section: aClass.section,
      subject: aClass.subject,
      room: aClass.room,
      createdBy: aClass.createdBy,
      students: listStudent,
      teachers: listTeacher,
      gradeList: aClass.gradeList,
    });
  }

  async getClassGradeList(classId: string, user: Users): Promise<string> {
    const aClass = await this.classesRepository.findOne(classId);
    if (aClass == null) {
      throw new NotFoundException('Class id is not Found');
    }
    if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString()) || (user.studentId && !this.stringArrUtils.IsInClude(aClass.students, user.studentId.toString()))) {
      throw new NotAcceptableException('You are not member of this class');
    }
    return aClass.gradeList ? aClass.gradeList : "";
  }

  async setClassGradeList(user: Users, setGradeListDto: SetGradeListDto): Promise<Classes>{
    const { classId, gradeListJsonString } = setGradeListDto;
    const aClass = await this.classesRepository.findOne(classId);
    if (aClass == null) {
      throw new NotFoundException('Class id is not Found');
    }
    if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString())) {
      throw new NotAcceptableException('You are not teacher of this class');
    }
    aClass.gradeList = gradeListJsonString;
    return this.classesRepository.save(aClass);
  }
}
