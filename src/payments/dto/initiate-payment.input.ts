import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { PaymentProvider } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

registerEnumType(PaymentProvider, {
  name: 'PaymentProvider',
});

@InputType()
export class InitiatePaymentInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  insuranceId: number;

  @Field(() => PaymentProvider)
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider: PaymentProvider;
}
