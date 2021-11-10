import { IsNotEmptyObject, IsOptional } from "class-validator";

export class CreateInvitationLink{

    @IsNotEmptyObject()
    classId: string;

    @IsOptional()
    emailConstrain: string;

    @IsOptional()
    inviteEmail: string[];

}