import { IsNotEmptyObject } from "class-validator";

export class JoinInvitationLink {

    @IsNotEmptyObject()
    linkId: string;

}