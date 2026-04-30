import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskService } from './task.service';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly tasks: TaskService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTaskDto) {
    return this.tasks.create(req.user.id, dto);
  }

  @Patch(':id/assign')
  assign(@Req() req: any, @Param('id') id: string, @Body() dto: AssignTaskDto) {
    return this.tasks.assign(req.user.id, id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.tasks.updateStatus(req.user.id, id, dto);
  }

  @Get()
  list(@Req() req: any, @Query() filters: TaskFilterDto) {
    return this.tasks.list(req.user.id, filters);
  }
}

