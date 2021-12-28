import { IsNotEmptyObject, IsOptional } from 'class-validator';

export class ModifyAssignmentDto {

    @IsNotEmptyObject()
    listAssignment: [{

        _id: string;

        title: string;

        description: string;

        totalPoint: number;

        expiredTime: number;
        
        position: number;
        
        isFinalized: boolean;

    }];

    @IsNotEmptyObject()
    classId: string;
}
