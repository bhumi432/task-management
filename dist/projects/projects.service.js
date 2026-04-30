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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProject(actor, dto) {
        if (actor.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only ADMIN can create projects');
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
    async getProjectsForUser(userId) {
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
    async addMember(actor, projectId, userId) {
        if (actor.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only ADMIN can manage team members');
        }
        if (userId === actor.id) {
        }
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true }
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        try {
            await this.prisma.teamMember.create({
                data: { projectId, userId },
                select: { id: true }
            });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new common_1.BadRequestException('User is already a team member');
            }
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
                throw new common_1.BadRequestException('Invalid userId or projectId');
            }
            throw e;
        }
        return { ok: true };
    }
    async removeMember(actor, projectId, userId) {
        if (actor.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only ADMIN can manage team members');
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
        if (!membership)
            throw new common_1.NotFoundException('Team member not found');
        await this.prisma.teamMember.delete({
            where: {
                userId_projectId: { userId, projectId }
            }
        });
        return { ok: true };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
