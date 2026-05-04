import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class CreateGuaranteeInput {
  @Field(() => String)
  code: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  isActive?: boolean;
}

@InputType()
export class UpdateGuaranteeInput extends PartialType(CreateGuaranteeInput) {
  @Field(() => Int)
  id: number;
}
