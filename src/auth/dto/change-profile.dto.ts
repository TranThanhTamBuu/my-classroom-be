import { IsString} from 'class-validator';

export class ChangeProfileDto {
    @IsString()
    name: string;

    @IsString()
    studentId: string;
}