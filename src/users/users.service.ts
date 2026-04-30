import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Safe directory for admins: no passwords. */
  listDirectory() {
    return this.prisma.user.findMany({
      orderBy: { email: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
  }
}

