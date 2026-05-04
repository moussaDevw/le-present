import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { PersonType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

registerEnumType(PersonType, {
  name: 'PersonType',
});

@InputType()
export class PartyInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email?: string;

  @Field(() => PersonType, { defaultValue: PersonType.PHYSIQUE })
  @IsEnum(PersonType)
  @IsOptional()
  personType: PersonType;
}

@InputType()
export class CreateSubscriptionInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  quoteId: number;

  @Field(() => PartyInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartyInput)
  assure?: PartyInput;

  @Field(() => PartyInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartyInput)
  souscripteur?: PartyInput;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  dateEffet?: string; // AAAA-MM-JJ
}
