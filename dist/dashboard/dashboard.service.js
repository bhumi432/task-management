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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async summary(userId) {
        const where = {
            project: {
                teamMembers: { some: { userId } }
            }
        };
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
                    status: { not: client_1.TaskStatus.DONE }
                }
            })
        ]);
        const counts = new Map();
        for (const row of byStatus) {
            counts.set(row.status, row._count._all);
        }
        const completedTasks = counts.get(client_1.TaskStatus.DONE) ?? 0;
        const pendingTasks = (counts.get(client_1.TaskStatus.TODO) ?? 0) + (counts.get(client_1.TaskStatus.IN_PROGRESS) ?? 0);
        const totalTasks = completedTasks + pendingTasks;
        return {
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
