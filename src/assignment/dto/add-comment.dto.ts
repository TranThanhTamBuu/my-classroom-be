import { IsNotEmptyObject } from 'class-validator';

export class AddCommentDto {

    @IsNotEmptyObject()
    assignmentId: string;

    @IsNotEmptyObject()
    comment: string;
}
