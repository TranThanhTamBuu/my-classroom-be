import { IsNotEmptyObject } from 'class-validator';

export class SetFinalizedDto {
    @IsNotEmptyObject()
    assignmentId: string;

    @IsNotEmptyObject()
    isFinalized: boolean;
}