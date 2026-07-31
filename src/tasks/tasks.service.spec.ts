// tasks/tasks.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  // Мок PrismaService — только те методы, которые реально используются в TasksService
  const mockPrismaService = {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // подменяем реальный PrismaService на мок
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks(); // сбрасываем состояние моков перед каждым тестом
  });

  it('должен быть определён', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('должен вернуть только задачи текущего пользователя', async () => {
      const userId = 'user-1';
      const expectedTasks = [
        { id: 'task-1', title: 'Задача 1', userId },
        { id: 'task-2', title: 'Задача 2', userId },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(expectedTasks);

      const result = await service.findAll(userId);

      expect(result).toEqual(expectedTasks);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('findOne', () => {
    it('должен вернуть задачу, если она принадлежит пользователю', async () => {
      const task = { id: 'task-1', title: 'Задача', userId: 'user-1' };
      mockPrismaService.task.findUnique.mockResolvedValue(task);

      const result = await service.findOne('task-1', 'user-1');

      expect(result).toEqual(task);
    });

    it('должен выбросить NotFoundException, если задачи не существует', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('несуществующий-id', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('должен выбросить ForbiddenException, если задача принадлежит другому пользователю', async () => {
      const task = { id: 'task-1', title: 'Задача', userId: 'другой-user' };
      mockPrismaService.task.findUnique.mockResolvedValue(task);

      await expect(service.findOne('task-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('должен передать userId вместе с данными из dto при создании', async () => {
      const userId = 'user-1';
      const dto = { title: 'Новая задача' };
      const expectedTask = { id: 'task-1', ...dto, userId };

      mockPrismaService.task.create.mockResolvedValue(expectedTask);

      const result = await service.create(dto, userId);

      expect(result).toEqual(expectedTask);
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: { ...dto, userId },
      });
    });
  });

  describe('update', () => {
    it('должен обновить задачу, если она принадлежит пользователю', async () => {
      const userId = 'user-1';
      const existingTask = { id: 'task-1', title: 'Старое название', userId };
      const dto = { title: 'Новое название' };
      const updatedTask = { ...existingTask, ...dto };

      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.update('task-1', dto, userId);
      expect(result).toEqual(updatedTask);
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: dto,
      });
    });

    it('должен выбросить ForbiddenException при попытке обновить чужую задачу', async () => {
      const existingTask = {
        id: 'task-1',
        title: 'Задача',
        userId: 'другой-user',
      };
      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);

      await expect(
        service.update('task-1', { title: 'Новое' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);

      // Важно: проверяем, что update даже НЕ ВЫЗЫВАЛСЯ, раз проверка владения не прошла
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('должен удалить задачу, если она принадлежит пользователю', async () => {
      const userId = 'user-1';
      const existingTask = { id: 'task-1', title: 'Задача', userId };

      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);
      mockPrismaService.task.delete.mockResolvedValue(existingTask);

      await service.remove('task-1', userId);

      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });

    it('должен выбросить ForbiddenException при попытке удалить чужую задачу', async () => {
      const existingTask = {
        id: 'task-1',
        title: 'Задача',
        userId: 'другой-user',
      };
      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);

      await expect(service.remove('task-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockPrismaService.task.delete).not.toHaveBeenCalled();
    });
  });
});
