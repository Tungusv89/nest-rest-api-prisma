import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // экспортируем, т.к. AuthModule позже будет использовать этот сервис
})
export class UsersModule {}
