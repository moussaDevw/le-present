import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Periodicity } from '@prisma/client';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class Quote {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  vehicleId: number;

  @Field(() => Int)
  companyId: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Int, { nullable: true })
  fleetId?: number;

  @Field(() => Int)
  duration: number;

  @Field(() => Periodicity)
  periodicity: Periodicity;

  @Field(() => Float)
  price: number;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;

  @Field(() => String, { nullable: true })
  externalRequestId?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  rawRequest?: any;

  @Field(() => GraphQLJSONObject, { nullable: true })
  rawResponse?: any;

  @Field(() => Date)
  createdAt: Date;
}
