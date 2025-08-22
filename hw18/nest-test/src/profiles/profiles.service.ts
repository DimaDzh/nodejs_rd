import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProfileDto: CreateProfileDto) {
    try {
      const profile = await this.prisma.profile.create({
        data: createProfileDto,
      });
      return profile;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Profile with this email already exists');
        }
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.profile.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }

    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    try {
      const profile = await this.prisma.profile.update({
        where: { id },
        data: updateProfileDto,
      });
      return profile;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Profile with id ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Profile with this email already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.profile.delete({
        where: { id },
      });
      return { message: `Profile with id ${id} has been removed` };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Profile with id ${id} not found`);
        }
      }
      throw error;
    }
  }
}
