import { IsNotEmptyObject } from 'class-validator';

export class CreateAssignmentDto {

    @IsNotEmptyObject()
    listAssignment: [{
        title: string;

        description: string;

        totalPoint: number;

        expiredTime: number;
        
        position: number;

    }];

    @IsNotEmptyObject()
    classId: string;
}
