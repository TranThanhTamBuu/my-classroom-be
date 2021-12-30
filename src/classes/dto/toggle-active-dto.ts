import { IsBoolean } from 'class-validator';

export class ToggleActiveDto {
  classIds: string[];

  @IsBoolean()
  active: boolean;
}
