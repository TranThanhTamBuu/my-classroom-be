import { Body, Controller, Get, NotAcceptableException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LinkService } from './link.service';
import { CreateInvitationLink } from './dto/create-invitation-link.dto';
import { JoinInvitationLink } from './dto/join-invitation-link.dto';

@Controller('link')
@UseGuards(AuthGuard())
export class LinkController {
    constructor(private linkService: LinkService) { }
    
    @Post()
    async createLink(@Req() req, @Body() createInvitationLinkDto: CreateInvitationLink) {
        const { user } = req;
        if (user.studentId) throw new NotAcceptableException('Student can not create invitation link');
        return this.linkService.createInvitationLink(createInvitationLinkDto, user);
    }

    @Put('/accept')
    async joinByLink(@Req() req, @Body() joinInvitationLinkDto: JoinInvitationLink) {
        const { user } = req;
        return this.linkService.joinInvitationLink(joinInvitationLinkDto, user);
    }

    @Get('/check/:linkId')
    async checkEmailValid(@Req() req, @Param('linkId') linkId: string) {
        const { user } = req;
        console.log(req);
        return this.linkService.checkAuthAcceplink(linkId, user);
    }
}
