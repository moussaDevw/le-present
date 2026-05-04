import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { EnergyType, VehicleUsage } from '@prisma/client';

registerEnumType(EnergyType, {
  name: 'EnergyType',
  description: 'Type d\'énergie du véhicule (ESSENCE, DIESEL, ...)',
});

registerEnumType(VehicleUsage, {
  name: 'VehicleUsage',
  description: 'Usage du véhicule (COMMERCIAL, NON_COMMERCIAL)',
});

@ObjectType()
export class VehicleCategory {
  @Field(() => Int)
  id: number;

  @Field()
  code: string;

  @Field()
  label: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class VehicleGenre {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  categoryId: number;

  @Field()
  code: string;

  @Field()
  label: string;

  @Field()
  requiresCylinder: boolean;

  @Field()
  requiresUsage: boolean;

  @Field()
  requiresNbCartes: boolean;

  @Field()
  isActive: boolean;

  @Field(() => VehicleCategory, { nullable: true })
  category?: VehicleCategory;
}

@ObjectType()
export class Vehicle {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  ownerId: number;

  @Field(() => Int)
  genreId: number;

  @Field(() => EnergyType)
  energyType: EnergyType;

  @Field({ nullable: true })
  licensePlate?: string;

  @Field({ nullable: true })
  chassis?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  model?: string;

  @Field(() => Int, { nullable: true })
  fiscalPower?: number;

  @Field(() => Int, { nullable: true })
  numberOfSeats?: number;

  @Field(() => Int, { nullable: true })
  cylinderVolume?: number;

  @Field(() => VehicleUsage, { nullable: true })
  usage?: VehicleUsage;

  @Field({ nullable: true })
  circulationDate?: Date;

  @Field(() => Float, { nullable: true })
  valueNew?: number;

  @Field(() => Float, { nullable: true })
  valueCurrent?: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => VehicleGenre, { nullable: true })
  genre?: VehicleGenre;
}
