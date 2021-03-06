import { IsNotEmptyObject, IsOptional } from 'class-validator';

export class TeacherReviewRequest {

    @IsNotEmptyObject()
    studentId: string;

    @IsNotEmptyObject()
    assignmentId: string;

    @IsOptional()
    newGrade: number;

    @IsOptional()
    comment: string;

    @IsOptional()
    markAsFinal: boolean;
}
