// tasks/tasks.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('TasksGateway');

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      this.logger.log(`Клиент подключён: user:${payload.sub}`);
    } catch {
      this.logger.warn('Отклонено подключение с невалидным токеном');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Клиент отключился: ${client.id}`);
  }

  notifyTaskChange(userId: string, event: string, task: any) {
    this.server.to(`user:${userId}`).emit(event, task);
  }
}
