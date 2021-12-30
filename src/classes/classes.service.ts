import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classes } from './classes.entity';
import { Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { Users } from 'src/auth/users.entity';
import { AuthService } from 'src/auth/auth.service';
import { SetGradeListDto } from './dto/set-gradeList.dto';
import { SetListStudentDto } from './dto/set-list-student.dto';
import { ToggleActiveDto } from './dto/toggle-active-dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes) private classesRepository: Repository<Classes>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    private authService: AuthService,
  ) {}

  async getAllClasses(): Promise<Array<any>> {
    return Promise.all(
      (await this.classesRepository.find()).map(async (aClass) => ({
        ...aClass,
        createdBy: (await this.usersRepository.findOne(aClass.createdBy))?.name,
      })),
    );
  }

  async getTeacherClasses(teacher: Users): Promise<Classes[]> {
    return this.classesRepository.find({
      where: {
        $or: [
          { teachers: { $all: [teacher._id.toString()] } },
          { createdBy: teacher._id },
        ],
        active: true,
      },
    });
  }

  async getStudentClasses(student: Users): Promise<Classes[]> {
    return this.classesRepository.find({
      where: {
        students: { $all: [student.studentId] },
        active: true,
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
      createdAt: new Date(),
      teachers: [creator._id.toString()],
      students: [],
    });

    return this.classesRepository.save(newClass);
  }

  async getAClass(classId: string): Promise<Classes> {
    return this.classesRepository.findOne(classId);
  }

  async saveAClass(aClass: Classes) {
    return this.classesRepository.save(aClass);
  }

  async getClassDetail(classId: string): Promise<any> {
    const aClass = await this.classesRepository.findOne(classId);
    if (aClass === null) {
      throw new NotFoundException('Class id is not Found');
    }
    if (!aClass.active) {
      throw new ForbiddenException();
    }
    const listStudent = await this.authService.getListUserByStuId(
      aClass.students,
    );
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
    if (aClass === null) {
      throw new NotFoundException('Class id is not Found');
    }
    if (
      !aClass.teachers.includes(user._id.toString()) ||
      (user.studentId && !aClass.students.includes(user.studentId.toString()))
    ) {
      throw new NotAcceptableException('You are not member of this class');
    }
    return aClass.gradeList ? aClass.gradeList : '';
  }

  async setClassGradeList(
    user: Users,
    setGradeListDto: SetGradeListDto,
  ): Promise<Classes> {
    const { classId, gradeListJsonString } = setGradeListDto;
    const aClass = await this.classesRepository.findOne(classId);
    if (aClass === null) {
      throw new NotFoundException('Class id is not Found');
    }
    if (!aClass.teachers.includes(user._id.toString())) {
      throw new NotAcceptableException('You are not teacher of this class');
    }
    aClass.gradeList = gradeListJsonString;
    return this.classesRepository.save(aClass);
  }

  async setListStudent(
    user: Users,
    setListStudent: SetListStudentDto,
  ): Promise<Classes> {
    const { classId, listStudent } = setListStudent;
    const aClass = await this.classesRepository.findOne(classId);
    if (aClass === null) {
      throw new NotFoundException('Class id is not Found');
    }
    if (!aClass.teachers.includes(user._id.toString())) {
      throw new NotAcceptableException('You are not teacher of this class');
    }
    aClass.listStudent = listStudent;
    return this.classesRepository.save(aClass);
  }

  async toggleActiveClasses(
    toggleActiveDto: ToggleActiveDto,
  ): Promise<Classes[]> {
    const { classIds, active } = toggleActiveDto;
    return Promise.all(
      classIds.map(async (classId) => {
        const aClass = await this.classesRepository.findOne(classId);
        aClass.active = active;
        return this.classesRepository.save(aClass);
      }),
    );
  }
}
