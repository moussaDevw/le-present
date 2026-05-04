import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class UserBasicInfo {
  @Field(() => Int)
  id: number;

  @Field()
  phone: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;
  
  @Field()
  isActive: boolean;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserBasicInfo)
  user: UserBasicInfo;
}

export enum LoginStatus {
  LOGGED_IN = 'LOGGED_IN',
  REGISTRATION_REQUIRED = 'REGISTRATION_REQUIRED',
}

registerEnumType(LoginStatus, {
  name: 'LoginStatus',
  description: 'The status of the login process',
});

@ObjectType()
export class VerifyOtpResponse {
  @Field(() => LoginStatus)
  status: LoginStatus;

  @Field(() => AuthPayload, { nullable: true })
  payload?: AuthPayload; // Provided if LOGGED_IN

  @Field({ nullable: true })
  registrationToken?: string; // Provided if REGISTRATION_REQUIRED
}

@ObjectType()
export class SuccessResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
