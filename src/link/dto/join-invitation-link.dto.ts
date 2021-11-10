import { IsNotEmptyObject, IsOptional } from "class-validator";

export class JoinInvitationLink {

    @IsNotEmptyObject()
    linkId: string;

}