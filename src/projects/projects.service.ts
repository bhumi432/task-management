import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(actor: { id: string; role: Role }, dto: CreateProjectDto) {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only ADMIN can create projects');
    }

    const project = await this.prisma.project.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        createdById: actor.id,
        teamMembers: {
          create: {
            userId: actor.id
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdById: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return project;
  }

  async getProjectsForUser(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        teamMembers: {
          some: { userId }
        }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdById: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return projects;
  }

  async addMember(actor: { id: string; role: Role }, projectId: string, userId: string) {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only ADMIN can manage team members');
    }

    if (userId === actor.id) {
      // Allowed but usually redundant; keep it explicit.
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true }
    });
    if (!project) throw new NotFoundException('Project not found');

    try {
      await this.prisma.teamMember.create({
        data: { projectId, userId },
        select: { id: true }
      });
    } catch (e) {
      // Unique constraint for (userId, projectId)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('User is already a team member');
      }
      // Foreign key (user/project missing)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException('Invalid userId or projectId');
      }
      throw e;
    }

    return { ok: true };
  }

  async removeMember(actor: { id: string; role: Role }, projectId: string, userId: string) {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only ADMIN can manage team members');
    }

    const membership = await this.prisma.teamMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      },
      select: { id: true }
    });
    if (!membership) throw new NotFoundException('Team member not found');

    await this.prisma.teamMember.delete({
      where: {
        userId_projectId: { userId, projectId }
      }
    });

    return { ok: true };
  }
}

