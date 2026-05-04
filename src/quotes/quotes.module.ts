import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesResolver } from './quotes.resolver';
import { AasApiService } from './services/aas-api.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [QuotesResolver, QuotesService, AasApiService],
  exports: [QuotesService, AasApiService],
})
export class QuotesModule {}
