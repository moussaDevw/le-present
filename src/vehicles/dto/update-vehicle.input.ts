import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsBoolean } from 'class-validator';
import { CreateVehicleInput } from './create-vehicle.input';

@InputType()
export class UpdateVehicleInput extends PartialType(CreateVehicleInput) {
  @Field(() => Int)
  @IsInt({ message: 'L\'ID du véhicule est requis.' })
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit être un booléen.' })
  isActive?: boolean;
}
