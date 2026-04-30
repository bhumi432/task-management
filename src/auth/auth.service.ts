import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async signup(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        password: passwordHash,
        role: dto.role ?? Role.MEMBER
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const accessToken = await this.signAccessToken(user.id, user.email, user.role);
    return { user, accessToken };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, password: true, name: true }
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccessToken(user.id, user.email, user.role);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken
    };
  }

  private async signAccessToken(userId: string, email: string, role: Role) {
    return this.jwt.signAsync({
      sub: userId,
      email,
      role
    });
  }
}

