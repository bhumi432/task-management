import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.projects.createProject(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listForMe(@Req() req: any) {
    return this.projects.getProjectsForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':projectId/members')
  addMember(@Req() req: any, @Param('projectId') projectId: string, @Body() dto: AddMemberDto) {
    return this.projects.addMember(req.user, projectId, dto.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':projectId/members/:userId')
  removeMember(@Req() req: any, @Param('projectId') projectId: string, @Param('userId') userId: string) {
    return this.projects.removeMember(req.user, projectId, userId);
  }
}

