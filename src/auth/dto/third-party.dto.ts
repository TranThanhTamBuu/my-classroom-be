import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class ThirdPartyDto {
  @IsString()
  @MinLength(8)
  name: string;

  @IsOptional()
  @IsString()
  photo: string;

  @IsString()
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,
    { message: 'Email is invalid.' },
  )
  email: string;
}
