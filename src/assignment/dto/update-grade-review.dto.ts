import { IsNotEmptyObject, IsOptional } from 'class-validator';

export class TeacherReviewRequest {

    @IsNotEmptyObject()
    studentId: string;

    @IsNotEmptyObject()
    assignmentId: string;

    @IsOptional()
    newGrade: string;

    @IsOptional()
    comment: number;

    @IsOptional()
    markAsFinal: boolean;
}
