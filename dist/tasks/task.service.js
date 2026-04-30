"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let TaskService = class TaskService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(actorId, dto) {
        const isMember = await this.prisma.teamMember.findFirst({
            where: { userId: actorId, projectId: dto.projectId },
            select: { id: true }
        });
        if (!isMember)
            throw new common_1.ForbiddenException('You are not a member of this project');
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
    async assign(actorId, taskId, dto) {
        const task = await this.prisma.task.findFirst({
            where: {
                id: taskId,
                project: {
                    teamMembers: { some: { userId: actorId } }
                }
            },
            select: { id: true, projectId: true }
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (dto.assignedToId) {
            const assigneeIsMember = await this.prisma.teamMember.findFirst({
                where: { userId: dto.assignedToId, projectId: task.projectId },
                select: { id: true }
            });
            if (!assigneeIsMember)
                throw new common_1.BadRequestException('Assignee is not a member of this project');
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
    async updateStatus(actorId, taskId, dto) {
        const task = await this.prisma.task.findFirst({
            where: {
                id: taskId,
                project: {
                    teamMembers: { some: { userId: actorId } }
                }
            },
            select: { id: true }
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
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
    async list(actorId, filters) {
        const where = {
            project: {
                teamMembers: { some: { userId: actorId } }
            }
        };
        if (filters.projectId)
            where.projectId = filters.projectId;
        if (filters.assignedToId)
            where.assignedToId = filters.assignedToId;
        if (filters.status)
            where.status = filters.status;
        if (filters.overdue) {
            where.AND = [
                ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
                { dueDate: { lt: new Date() } },
                { status: { not: client_1.TaskStatus.DONE } }
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
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskService);
