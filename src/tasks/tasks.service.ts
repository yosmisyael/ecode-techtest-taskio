import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto) {
    // Verify category belongs to user if provided
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, userId },
      });

      if (!category) {
        throw new NotFoundException(
          'Category not found or does not belong to you',
        );
      }
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        details: dto.details,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        isStarred: dto.isStarred ?? false,
        userId,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  }

  async findAll(userId: string, query: QueryTaskDto) {
    const {
      page = 1,
      limit = 10,
      categoryId,
      search,
      deadlineFrom,
      deadlineTo,
      completed,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = { userId };

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Search by title (partial match)
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Filter by deadline range
    if (deadlineFrom || deadlineTo) {
      where.deadline = {};
      if (deadlineFrom) {
        where.deadline.gte = new Date(deadlineFrom);
      }
      if (deadlineTo) {
        where.deadline.lte = new Date(deadlineTo);
      }
    }

    // Filter by completion status
    if (completed === 'true') {
      where.isCompleted = true;
    } else if (completed === 'false') {
      where.isCompleted = false;
    }
    // 'all' or undefined = no filter on isCompleted

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: { category: true },
        orderBy: [{ isStarred: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findHistory(userId: string, query: QueryTaskDto) {
    const modifiedQuery = { ...query, completed: 'true' };
    return this.findAll(userId, modifiedQuery);
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify category belongs to user if being changed
    if (dto.categoryId && dto.categoryId !== task.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, userId },
      });

      if (!category) {
        throw new NotFoundException(
          'Category not found or does not belong to you',
        );
      }
    }

    const data: Prisma.TaskUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.details !== undefined) data.details = dto.details;
    if (dto.deadline !== undefined) data.deadline = new Date(dto.deadline);
    if (dto.isStarred !== undefined) data.isStarred = dto.isStarred;
    if (dto.isCompleted !== undefined) data.isCompleted = dto.isCompleted;
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async toggleComplete(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data: { isCompleted: !task.isCompleted },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({ where: { id } });

    return { message: 'Task deleted successfully' };
  }
}
