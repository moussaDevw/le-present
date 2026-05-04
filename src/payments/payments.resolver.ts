import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PaymentsService } from './payments.service';
import { InitiatePaymentInput } from './dto/initiate-payment.input';
import { PaymentInitiationResponse } from './models/payment.models';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver()
@UseGuards(GqlAuthGuard)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => PaymentInitiationResponse)
  async initiatePayment(
    @CurrentUser() user: any,
    @Args('input') input: InitiatePaymentInput,
  ) {
    return this.paymentsService.initiatePayment(user.id, input);
  }

  @Mutation(() => Boolean)
  async simulatePaymentSuccess(
    @Args('transactionReference') transactionReference: string,
  ) {
    const res = await this.paymentsService.simulatePaymentSuccess(transactionReference);
    return res.success;
  }
}
