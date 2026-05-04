import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';
import { Vehicle, VehicleCategory, VehicleGenre } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) { }

  async getVehicleCategories(): Promise<VehicleCategory[]> {
    return this.prisma.vehicleCategory.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async getVehicleGenres(categoryId?: number): Promise<VehicleGenre[]> {
    return this.prisma.vehicleGenre.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { code: 'asc' },
    });
  }

  async findMyVehicles(userId: number): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
      include: {
        genre: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createVehicle(userId: number, input: CreateVehicleInput): Promise<Vehicle> {
    // Vérifier si le genre existe
    const genre = await this.prisma.vehicleGenre.findUnique({
      where: { id: input.genreId },
    });

    if (!genre) {
      throw new NotFoundException(`Le genre de véhicule (ID: ${input.genreId}) n'existe pas.`);
    }

    return this.prisma.vehicle.create({
      data: {
        ...input,
        ownerId: userId,
      },
      include: {
        genre: true,
      },
    });
  }

  async updateVehicle(userId: number, input: UpdateVehicleInput): Promise<Vehicle> {
    const { id, ...data } = input;

    // Vérifier l'appartenance
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, ownerId: userId, deletedAt: null },
    });

    if (!vehicle) {
      throw new NotFoundException(`Véhicule introuvable.`);
    }

    return this.prisma.vehicle.update({
      where: { id },
      data,
      include: {
        genre: true,
      },
    });
  }

  async deleteVehicle(userId: number, id: number): Promise<boolean> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, ownerId: userId, deletedAt: null },
    });

    if (!vehicle) {
      throw new NotFoundException(`Véhicule introuvable.`);
    }

    await this.prisma.vehicle.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return true;
  }
}
