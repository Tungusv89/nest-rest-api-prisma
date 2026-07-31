import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/user.module'; // проверь точное имя файла
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, TasksModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
