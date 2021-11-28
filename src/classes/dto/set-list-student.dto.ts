import { IsNotEmptyObject } from 'class-validator';

export class SetListStudentDto {
    @IsNotEmptyObject()
    classId: string;

    @IsNotEmptyObject()
    listStudent: [
        {
            name: string,
            id: string
        }
    ];
}