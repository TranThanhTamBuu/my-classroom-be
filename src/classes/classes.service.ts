import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classes } from './classes.entity';
import { Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { Users } from 'src/auth/users.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes) private classesRepository: Repository<Classes>,
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
      teachers: [creator._id]
    });

    return this.classesRepository.save(newClass);
  }

  async getAClass(classId: string): Promise<Classes>{
    return this.classesRepository.findOne(classId);
  }

  async saveAClass(aClass: Classes){
    return this.classesRepository.save(aClass);
  }
}
