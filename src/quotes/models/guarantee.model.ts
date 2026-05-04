import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Guarantee {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  code: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  description?: string;
}
