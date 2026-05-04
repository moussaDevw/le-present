import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { EnergyType, VehicleUsage } from '@prisma/client';
import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDate,
  ValidateIf,
  IsNotEmpty,
  Min,
} from 'class-validator';

@InputType()
export class CreateVehicleInput {
  @Field(() => Int)
  @IsInt({ message: 'L\'ID du genre doit être un nombre entier.' })
  genreId: number;

  @Field(() => EnergyType)
  @IsEnum(EnergyType, { message: 'Type d\'énergie invalide.' })
  energyType: EnergyType;

  @Field({ nullable: true })
  @ValidateIf((o) => !o.chassis)
  @IsNotEmpty({
    message: "La plaque d'immatriculation est obligatoire si le châssis est absent.",
  })
  @IsString({ message: 'La plaque d\'immatriculation doit être du texte.' })
  licensePlate?: string;

  @Field({ nullable: true })
  @ValidateIf((o) => !o.licensePlate)
  @IsNotEmpty({
    message: "Le numéro de châssis est obligatoire si la plaque est absente.",
  })
  @IsString({ message: 'Le numéro de châssis doit être du texte.' })
  chassis?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'La marque doit être du texte.' })
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Le modèle doit être du texte.' })
  model?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: 'La puissance fiscale doit être un nombre entier.' })
  @Min(1, { message: 'La puissance fiscale doit être au moins de 1 CV.' })
  fiscalPower?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: 'Le nombre de places doit être un nombre entier.' })
  @Min(1, { message: 'Le véhicule doit avoir au moins 1 place.' })
  numberOfSeats?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: 'Le volume du cylindre doit être un nombre entier.' })
  cylinderVolume?: number;

  @Field(() => VehicleUsage, { nullable: true })
  @IsOptional()
  @IsEnum(VehicleUsage, { message: 'Usage du véhicule invalide.' })
  usage?: VehicleUsage;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate({ message: 'La date de circulation doit être une date valide.' })
  circulationDate?: Date;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'La valeur à neuf doit être un nombre.' })
  valueNew?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'La valeur vénale doit être un nombre.' })
  valueCurrent?: number;
}
