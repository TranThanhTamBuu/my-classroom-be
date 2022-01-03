import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: process.env.FE_URL })
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('NotificationGateway');

  afterInit(server: any) {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected:    ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @WebSocketServer()
  wss: Server;

  sendNotification(userId: string, payload: any) {
    this.wss.to(userId).emit('notify', payload);
  }

  @SubscribeMessage('listen')
  handleListen(client: Socket, room: string) {
    client.join(room);
  }
}
