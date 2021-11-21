import { IsNotEmptyObject, IsOptional } from 'class-validator';

export class ModifyAssignmentDto {

    @IsNotEmptyObject()
    assignmentId: string;

    @IsNotEmptyObject()
    title: string;

    @IsOptional()
    description: string;

    @IsNotEmptyObject()
    totalPoint: number;

    @IsOptional()
    expiredTime: number;

    @IsNotEmptyObject()
    classId: string;
}
