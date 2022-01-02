import { IsString, Matches, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,
    { message: 'Email is invalid.' },
  )
  email: string;
}
