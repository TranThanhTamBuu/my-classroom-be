import { IsNotEmptyObject } from 'class-validator';

export class SetListGradeDto {
    @IsNotEmptyObject()
    assignmentId: string;

    @IsNotEmptyObject()
    listGrade: [
        {
            studentId: string,
            grade: number,
        }
    ];

    @IsNotEmptyObject()
    isImport: boolean;

    @IsNotEmptyObject()
    isFinalized: boolean;
}