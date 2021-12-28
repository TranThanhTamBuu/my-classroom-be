import { IsNotEmptyObject } from 'class-validator';

export class AddReviewRequestDto {

    @IsNotEmptyObject()
    assignmentId: string;

    @IsNotEmptyObject()
    studentComment: string;

    @IsNotEmptyObject()
    expectedGrade: number;
}
