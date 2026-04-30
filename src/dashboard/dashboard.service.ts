import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(userId: string) {
    const where = {
      project: {
        teamMembers: { some: { userId } }
      }
    } as const;

    const [byStatus, overdueTasks] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['status'],
        where,
        _count: { _all: true }
      }),
      this.prisma.task.count({
        where: {
          ...where,
          dueDate: { lt: new Date() },
          status: { not: TaskStatus.DONE }
        }
      })
    ]);

    const counts = new Map<TaskStatus, number>();
    for (const row of byStatus) {
      counts.set(row.status, row._count._all);
    }

    const completedTasks = counts.get(TaskStatus.DONE) ?? 0;
    const pendingTasks = (counts.get(TaskStatus.TODO) ?? 0) + (counts.get(TaskStatus.IN_PROGRESS) ?? 0);
    const totalTasks = completedTasks + pendingTasks;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks
    };
  }
}

