import { IsNotEmptyObject } from 'class-validator';

export class SetGradeListDto {
    @IsNotEmptyObject()
    classId: string;

    @IsNotEmptyObject()
    gradeListJsonString: string;
}
