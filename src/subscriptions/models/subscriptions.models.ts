import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { InsuranceStatus, Periodicity } from '@prisma/client';
import { Vehicle } from '../../vehicles/models/vehicles.models';

registerEnumType(InsuranceStatus, {
  name: 'InsuranceStatus',
});

registerEnumType(Periodicity, {
  name: 'Periodicity',
});

@ObjectType()
export class InsuranceDetail {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  insuranceId: number;

  @Field({ nullable: true })
  attestationNumber?: string;

  @Field({ nullable: true })
  linkAttestation?: string;

  @Field({ nullable: true })
  linkCarteBrune?: string;
}

@ObjectType()
export class Subscription {
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
  quoteId?: number;

  @Field()
  policyNumber: string;

  @Field()
  externalPartnerRef: string;

  @Field(() => Int)
  duration: number;

  @Field(() => Periodicity)
  periodicity: Periodicity;

  @Field(() => InsuranceStatus)
  status: InsuranceStatus;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Vehicle, { nullable: true })
  vehicle?: Vehicle;

  @Field(() => InsuranceDetail, { nullable: true })
  detail?: InsuranceDetail;
}
