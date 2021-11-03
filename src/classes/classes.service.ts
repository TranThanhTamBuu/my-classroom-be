import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classes } from './classes.entity';
import { Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes) private classesRepository: Repository<Classes>,
  ) {}

  async getClasses(): Promise<Classes[]> {
    return this.classesRepository.find();
  }

  async createClass(createClassDto: CreateClassDto): Promise<Classes> {
    const { name, section, room, subject } = createClassDto;

    const newClass = this.classesRepository.create({
      name,
      section,
      room,
      subject,
    });

    return this.classesRepository.save(newClass);
  }
}
