import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(8)
  name: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is not strong enough.',
  })
  password: string;

  @IsOptional()
  @IsString()
  studentId: string;

  @IsString()
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,
    { message: 'Email is invalid.' },
  )
  email: string;

  @IsOptional()
  @IsBoolean()
  isAdmin: boolean;
}
