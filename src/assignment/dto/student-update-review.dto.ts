import { IsNotEmptyObject, IsOptional } from 'class-validator';

export class StudentUpdateReviewRequestDto {

    @IsNotEmptyObject()
    assignmentId: string;

    @IsOptional()
    studentComment: string;

    @IsOptional()
    expectedGrade: number;
}
