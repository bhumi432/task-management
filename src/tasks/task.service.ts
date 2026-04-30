import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actorId: string, dto: CreateTaskDto) {
    const isMember = await this.prisma.teamMember.findFirst({
      where: { userId: actorId, projectId: dto.projectId },
      select: { id: true }
    });
    if (!isMember) throw new ForbiddenException('You are not a member of this project');

    return this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        dueDate: dto.dueDate
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        assignedToId: true,
        projectId: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async assign(actorId: string, taskId: string, dto: AssignTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          teamMembers: { some: { userId: actorId } }
        }
      },
      select: { id: true, projectId: true }
    });
    if (!task) throw new NotFoundException('Task not found');

    if (dto.assignedToId) {
      const assigneeIsMember = await this.prisma.teamMember.findFirst({
        where: { userId: dto.assignedToId, projectId: task.projectId },
        select: { id: true }
      });
      if (!assigneeIsMember) throw new BadRequestException('Assignee is not a member of this project');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { assignedToId: dto.assignedToId ?? null },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        assignedToId: true,
        projectId: true,
        updatedAt: true
      }
    });
  }

  async updateStatus(actorId: string, taskId: string, dto: UpdateTaskStatusDto) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          teamMembers: { some: { userId: actorId } }
        }
      },
      select: { id: true }
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: dto.status },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        assignedToId: true,
        projectId: true,
        updatedAt: true
      }
    });
  }

  async list(actorId: string, filters: TaskFilterDto) {
    // Baseline: user must belong to the task's project (enforces "Members can only view projects they belong to")
    const where: Prisma.TaskWhereInput = {
      project: {
        teamMembers: { some: { userId: actorId } }
      }
    };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.status) where.status = filters.status;

    if (filters.overdue) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { dueDate: { lt: new Date() } },
        { status: { not: TaskStatus.DONE } }
      ];
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        assignedToId: true,
        projectId: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
}

