// tasks.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.task.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Задача с id ${id} не найдена`);
    }
    if (task.userId !== userId) {
      throw new ForbiddenException('Это не твоя задача'); // защита от чтения чужих задач по id
    }
    return task;
  }

  create(dto: CreateTaskDto, userId: string) {
    return this.prisma.task.create({ data: { ...dto, userId } });
  }

  async update(id: string, dto: Partial<CreateTaskDto>, userId: string) {
    await this.findOne(id, userId); // проверка существования, иначе Prisma кинет свою ошибку вместо твоего NotFoundException
    return this.prisma.task.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.task.delete({ where: { id } });
  }
}
