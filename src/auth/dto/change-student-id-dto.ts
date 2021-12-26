import { IsString } from 'class-validator';

export class ChangeStudentIdDto {
  @IsString()
  userId: string;

  @IsString()
  studentId: string;
}
