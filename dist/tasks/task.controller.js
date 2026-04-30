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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const assign_task_dto_1 = require("./dto/assign-task.dto");
const create_task_dto_1 = require("./dto/create-task.dto");
const task_filter_dto_1 = require("./dto/task-filter.dto");
const update_task_status_dto_1 = require("./dto/update-task-status.dto");
const task_service_1 = require("./task.service");
let TaskController = class TaskController {
    tasks;
    constructor(tasks) {
        this.tasks = tasks;
    }
    create(req, dto) {
        return this.tasks.create(req.user.id, dto);
    }
    assign(req, id, dto) {
        return this.tasks.assign(req.user.id, id, dto);
    }
    updateStatus(req, id, dto) {
        return this.tasks.updateStatus(req.user.id, id, dto);
    }
    list(req, filters) {
        return this.tasks.list(req.user.id, filters);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, assign_task_dto_1.AssignTaskDto]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "assign", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_task_status_dto_1.UpdateTaskStatusDto]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, task_filter_dto_1.TaskFilterDto]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "list", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
