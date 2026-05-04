import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, Length, IsPhoneNumber } from 'class-validator';

@InputType()
export class SendOtpInput {
  @Field()
  @IsPhoneNumber(undefined, { message: 'Numéro de téléphone invalide.' })
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  phone: string;
}

@InputType()
export class VerifyOtpInput {
  @Field()
  @IsPhoneNumber(undefined, { message: 'Numéro de téléphone invalide.' })
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  phone: string;

  @Field()
  @IsString({ message: 'Le code doit être du texte.' })
  @Length(4, 6, { message: 'Le code OTP doit comporter entre 4 et 6 chiffres.' })
  code: string;
}

@InputType()
export class RegisterUserInput {
  @Field()
  @IsString({ message: 'Le prénom doit être du texte.' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  firstName: string;

  @Field()
  @IsString({ message: 'Le nom doit être du texte.' })
  @IsNotEmpty({ message: 'Le nom de famille est obligatoire.' })
  lastName: string;

  @Field()
  @IsString({ message: 'Le jeton d\'inscription est invalide.' })
  @IsNotEmpty({ message: 'Le jeton d\'inscription est obligatoire.' })
  registrationToken: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsString({ message: 'Le jeton de rafraîchissement est invalide.' })
  @IsNotEmpty({ message: 'Le jeton de rafraîchissement est obligatoire.' })
  token: string;
}
