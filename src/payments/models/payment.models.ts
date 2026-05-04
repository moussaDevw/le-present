import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { PaymentStatus } from '@prisma/client';

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});

@ObjectType()
export class PaymentInitiationResponse {
  @Field({ nullable: true })
  checkoutUrl?: string;

  @Field()
  transactionReference: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;
}
