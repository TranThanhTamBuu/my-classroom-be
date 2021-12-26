import { IsBoolean, IsString } from 'class-validator';

export class ToggleActiveDto {
  @IsString()
  userId: string;

  @IsBoolean()
  active: boolean;
}
