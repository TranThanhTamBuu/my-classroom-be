import { IsString, Matches, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MinLength(8)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is not strong enough.',
  })
  password: string;

  @IsString()
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,
    { message: 'Email is invalid.' },
  )
  email: string;
}
