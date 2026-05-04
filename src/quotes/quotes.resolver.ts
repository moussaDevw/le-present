import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { Quote } from './models/quote.model';
import { Guarantee } from './models/guarantee.model';
import { SimulateQuoteInput } from './dto/simulate-quote.input';
import { CreateGuaranteeInput, UpdateGuaranteeInput } from './dto/guarantee.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Quote)
export class QuotesResolver {
  constructor(private readonly quotesService: QuotesService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Quote)
  async simulateQuote(
    @CurrentUser() user: any,
    @Args('input') input: SimulateQuoteInput,
  ) {
    return this.quotesService.simulateQuote(user.userId, input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Quote])
  async myQuotes(@CurrentUser() user: any) {
    return this.quotesService.myQuotes(user.userId);
  }

  // Permet au frontend de charger la liste des garanties (1 - nom etc.)
  @UseGuards(GqlAuthGuard)
  @Query(() => [Guarantee])
  async getGuarantees() {
    return this.quotesService.getGuarantees();
  }

  // Permet d'ajouter une garantie dans le futur
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Guarantee)
  async createGuarantee(@Args('input') input: CreateGuaranteeInput) {
    return this.quotesService.createGuarantee(input);
  }

  // Permet de modifier une garantie
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Guarantee)
  async updateGuarantee(@Args('input') input: UpdateGuaranteeInput) {
    const { id, ...data } = input;
    return this.quotesService.updateGuarantee(id, data);
  }
}
