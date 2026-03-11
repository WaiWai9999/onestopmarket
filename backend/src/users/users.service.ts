import { Injectable, NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password: _, ...rest } = user;
    return rest;
  }

  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');

    if (dto.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId: string, dto: {
    name?: string;
    email?: string;
    address?: string;
    phone?: string;
    lastName?: string;
    firstName?: string;
    lastNameKana?: string;
    firstNameKana?: string;
    postalCode?: string;
    prefecture?: string;
    city?: string;
    addressLine?: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already in use');
    }

    const data: Record<string, unknown> = {};
    if (dto.email) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;

    // Structured name fields
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastNameKana !== undefined) data.lastNameKana = dto.lastNameKana;
    if (dto.firstNameKana !== undefined) data.firstNameKana = dto.firstNameKana;

    // Auto-compute name from structured fields
    if (dto.lastName !== undefined || dto.firstName !== undefined) {
      const ln = dto.lastName ?? user.lastName ?? '';
      const fn = dto.firstName ?? user.firstName ?? '';
      data.name = `${ln} ${fn}`.trim();
    } else if (dto.name) {
      data.name = dto.name;
    }

    // Structured address fields
    if (dto.postalCode !== undefined) data.postalCode = dto.postalCode;
    if (dto.prefecture !== undefined) data.prefecture = dto.prefecture;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.addressLine !== undefined) data.addressLine = dto.addressLine;

    // Auto-compute address from structured fields
    if (dto.postalCode !== undefined || dto.prefecture !== undefined || dto.city !== undefined || dto.addressLine !== undefined) {
      const pc = dto.postalCode ?? user.postalCode ?? '';
      const pref = dto.prefecture ?? user.prefecture ?? '';
      const ct = dto.city ?? user.city ?? '';
      const al = dto.addressLine ?? user.addressLine ?? '';
      data.address = pc ? `〒${pc} ${pref}${ct}${al}` : `${pref}${ct}${al}`;
    } else if (dto.address !== undefined) {
      data.address = dto.address;
    }

    const updated = await this.prisma.user.update({ where: { id: userId }, data });
    const { password: _, ...rest } = updated;
    return rest;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, address: true, phone: true, createdAt: true },
    });
    return users;
  }

  async updateRole(id: string, role: 'CUSTOMER' | 'ADMIN') {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.prisma.user.update({ where: { id }, data: { role } });
    const { password: _, ...rest } = updated;
    return rest;
  }
}
