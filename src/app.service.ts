import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';
import { Users } from './auth/users.entity';
import { Classes } from './classes/classes.entity';
import { Notification } from './notification/notification.entity';
import { NotificationService } from './notification/notification.service';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Classes) private classesRepository: Repository<Classes>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationService: NotificationService,
  ) {}

  async migrate(): Promise<void> {
    const user = await this.usersRepository.findOne('61c8a106c8c46d9b900d530b');
    const receivedFromUser = await this.usersRepository.findOne(
      '61ce08b699b32ad0a48fe9b4',
    );

    await this.notificationService.createAndSendNotification({
      user,
      receivedFromUser,
      description: 'Hello world',
      classId: 'lopabc',
    });
  }
}
