import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './auth/users.entity';
import { Classes } from './classes/classes.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Classes) private classesRepository: Repository<Classes>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async migrate(): Promise<void> {
    await this.usersRepository.update({}, { activation: true });
  }
}
