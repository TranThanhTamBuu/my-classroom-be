import { IsBoolean } from 'class-validator';

export class ToggleActiveDto {
  userIds: string[];

  @IsBoolean()
  active: boolean;
}
