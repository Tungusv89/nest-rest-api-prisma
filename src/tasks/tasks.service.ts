// tasks/tasks.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksGateway } from './tasks.gateway';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private tasksGateway: TasksGateway,
  ) {}

  findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId, deletedAt: null }, // скрываем удалённые из обычного списка
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task || task.deletedAt) {
      throw new NotFoundException(`Задача с id ${id} не найдена`);
    }
    if (task.userId !== userId) {
      throw new ForbiddenException('Это не твоя задача');
    }
    return task;
  }

  async create(dto: CreateTaskDto, userId: string) {
    const task = await this.prisma.task.create({ data: { ...dto, userId } });
    this.tasksGateway.notifyTaskChange(userId, 'task-created', task);
    return task;
  }

  async update(id: string, dto: Partial<CreateTaskDto>, userId: string) {
    await this.findOne(id, userId);
    const updated = await this.prisma.task.update({ where: { id }, data: dto });
    this.tasksGateway.notifyTaskChange(userId, 'task-updated', updated);
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    const deleted = await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() }, // soft delete вместо реального удаления
    });
    this.tasksGateway.notifyTaskChange(userId, 'task-deleted', { id });
    return deleted;
  }

  // Delta-sync — "догнать пропущенное" после переподключения
  findChangedSince(userId: string, since?: string) {
    return this.prisma.task.findMany({
      where: {
        userId,
        updatedAt: since ? { gt: new Date(since) } : undefined,
        // deletedAt НЕ фильтруем — клиенту нужно знать и про удалённые тоже
      },
      orderBy: { updatedAt: 'asc' },
    });
  }
}
