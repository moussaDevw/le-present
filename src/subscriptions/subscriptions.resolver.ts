import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionInput } from './dto/create-subscription.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Subscription } from './models/subscriptions.models';

@Resolver(() => Subscription)
@UseGuards(GqlAuthGuard)
export class SubscriptionsResolver {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Mutation(() => Subscription)
  async createSubscription(
    @CurrentUser() user: any,
    @Args('input') input: CreateSubscriptionInput,
  ) {
    return this.subscriptionsService.createSubscription(user.id, input);
  }

  @Query(() => [Subscription])
  async mySubscriptions(@CurrentUser() user: any) {
    return this.subscriptionsService.mySubscriptions(user.id);
  }
}
