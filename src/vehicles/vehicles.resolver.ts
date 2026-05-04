import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VehiclesService } from './vehicles.service';
import { Vehicle, VehicleCategory, VehicleGenre } from './models/vehicles.models';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class VehiclesResolver {
  constructor(private readonly vehiclesService: VehiclesService) { }

  @Query(() => [VehicleCategory], { name: 'vehicleCategories' })
  async getVehicleCategories() {
    return this.vehiclesService.getVehicleCategories();
  }

  @Query(() => [VehicleGenre], { name: 'vehicleGenres' })
  async getVehicleGenres(
    @Args('categoryId', { type: () => Int, nullable: true }) categoryId?: number,
  ) {
    return this.vehiclesService.getVehicleGenres(categoryId);
  }

  @Query(() => [Vehicle], { name: 'myVehicles' })
  async getMyVehicles(@CurrentUser() user: any) {
    return this.vehiclesService.findMyVehicles(user.userId);
  }

  @Mutation(() => Vehicle)
  async createVehicle(
    @CurrentUser() user: any,
    @Args('input') input: CreateVehicleInput,
  ) {
    return this.vehiclesService.createVehicle(user.userId, input);
  }

  @Mutation(() => Vehicle)
  async updateVehicle(
    @CurrentUser() user: any,
    @Args('input') input: UpdateVehicleInput,
  ) {
    return this.vehiclesService.updateVehicle(user.userId, input);
  }

  @Mutation(() => Boolean)
  async deleteVehicle(
    @CurrentUser() user: any,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.vehiclesService.deleteVehicle(user.userId, id);
  }
}
