import { IsNotEmptyObject, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsNotEmptyObject()
  name: string;

  @IsOptional()
  section: string;

  @IsOptional()
  subject: string;

  @IsOptional()
  room: string;
}
