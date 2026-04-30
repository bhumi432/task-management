import { IsOptional, IsUUID } from 'class-validator';

export class AssignTaskDto {
  /**
   * Set to null/undefined to unassign.
   */
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}

