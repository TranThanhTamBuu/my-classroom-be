import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';
import { ReadNotificationDto } from './dto/read-notification-dto';

@Controller('notification')
@UseGuards(AuthGuard())
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getAllNotifications(@Req() req) {
    const { user } = req;
    return this.notificationService.getNotifications(user._id);
  }

  @Post('/read')
  async read(
    @Body() readNotificationDto: ReadNotificationDto,
  ): Promise<{ success: boolean }> {
    return this.notificationService.readNotification(readNotificationDto);
  }
}
