import { InputType, Field, Int } from '@nestjs/graphql';
import { Periodicity } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';
import { IsInt, IsEnum, IsOptional, IsArray } from 'class-validator';

registerEnumType(Periodicity, {
  name: 'Periodicity',
});

@InputType()
export class SimulateQuoteInput {
  @Field(() => Int)
  @IsInt()
  vehicleId: number;

  @Field(() => Int)
  @IsInt()
  companyId: number;

  @Field(() => Int)
  @IsInt()
  duration: number;

  @Field(() => Periodicity)
  @IsEnum(Periodicity)
  periodicity: Periodicity;

  @Field(() => [Int], { nullable: true, defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  garanties?: number[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  garantiesOptPT?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  garantiesOptAR?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  garantiesOptAS?: string;
}
