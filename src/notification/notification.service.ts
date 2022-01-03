import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/auth/users.entity';
import { Repository } from 'typeorm';
import { ReadNotificationDto } from './dto/read-notification-dto';
import { Notification } from './notification.entity';
import { NotificationGateway } from './notification.gateway';

interface ICreateNotification {
  user: Users;
  receivedFromUser: Users;
  description: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private notificationGateway: NotificationGateway,
  ) {}

  async getNotifications(userId: string) {
    let notification = await this.notificationRepository.find({ userId });

    notification = await Promise.all(
      notification.map(async (notification) => {
        const receivedFromUser = await this.userRepository.findOne(
          notification.receivedFromUserId,
        );

        const { name, photo } = receivedFromUser;
        return { ...notification, receivedFromUser: { name, photo } };
      }),
    );

    notification.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return notification;
  }

  async readNotification(
    readNotificationDto: ReadNotificationDto,
  ): Promise<{ success: boolean }> {
    const { notificationIds } = readNotificationDto;
    await Promise.all(
      notificationIds.map(async (notificationId) => {
        const notification = await this.notificationRepository.findOne(
          notificationId,
        );
        notification.isRead = true;
        return this.notificationRepository.save(notification);
      }),
    );
    return { success: true };
  }

  private async createNotification(
    notification: ICreateNotification,
  ): Promise<Notification> {
    const { user, receivedFromUser, description } = notification;
    const newNotification = this.notificationRepository.create({
      userId: user._id,
      receivedFromUserId: receivedFromUser._id,
      description,
      createdAt: new Date(),
    });

    return await this.notificationRepository.save(newNotification);
  }

  async createAndSendNotification(
    notification: ICreateNotification,
  ): Promise<void> {
    const { name, photo } = notification.receivedFromUser;

    const newNotification = (await this.createNotification(
      notification,
    )) as any;

    newNotification.receivedFromUser = {
      name,
      photo,
    };

    this.notificationGateway.sendNotification(
      newNotification.userId.toString(),
      newNotification,
    );
  }
}
