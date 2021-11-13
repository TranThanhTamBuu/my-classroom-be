import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './link.entity';
import { CreateInvitationLink } from './dto/create-invitation-link.dto';
import { ClassesService } from 'src/classes/classes.service';
import { JoinInvitationLink } from './dto/join-invitation-link.dto';
import { Users } from 'src/auth/users.entity';
import { StringArraryUtils } from 'src/Utils/StringArrayInclude';
import MailService from 'src/mail/mail.service';


@Injectable()
export class LinkService {
    constructor(
        @InjectRepository(Link) private linkRepository: Repository<Link>,
        private classService: ClassesService,
        private stringArrUtils: StringArraryUtils,
        private mailService: MailService,
    ) { }

    async createInvitationLink(createInvitationLink: CreateInvitationLink, user: Users): Promise<any> {
        const { classId, emailConstrain, inviteEmail } = createInvitationLink;
        console.log(createInvitationLink);
        const aClass = await this.classService.getAClass(classId);
        if (aClass) {
            if (this.stringArrUtils.IsInClude(aClass.teachers,user._id.toString())) {
                // create private link and send mail
                // create expired time: 1 week after creating link:
                console.log('teacher of class');
                const expiredTime = Date.now() + 7 * 24 * 3600;
                if (inviteEmail && inviteEmail.length > 0) {
                    console.log("invite by mail");
                    const aLink = this.linkRepository.create({
                        isPrivateLink: true,
                        classId: classId,
                        emailConstrain: null,
                        inviteEmail: inviteEmail,
                        expiredTime: expiredTime,
                    })
                    await this.linkRepository.save(aLink);
                    const inviteLink = `${process.env.FE_URL}/activate/${aLink._id}`;
                    // send mail:
                    inviteEmail.forEach(val => {
                        console.log("send to: " + val.toString());
                        this.mailService.sendMail(val.toString(), inviteLink, aClass.name.toString());
                    });
                    console.log("done");
                    return Promise.resolve({
                        success: true,
                        link: inviteLink,
                    });
                }
                // create public link:
                else {
                    const aLink = this.linkRepository.create({
                        isPrivateLink: false,
                        classId: classId,
                        emailConstrain: emailConstrain,
                        inviteEmail: null,
                        expiredTime: -1,
                    });
                    await this.linkRepository.save(aLink);
                    return Promise.resolve({
                        success: true,
                        link: `${process.env.FE_URL}/activate/${aLink._id}`,
                    });
                }
            } else {
                throw new NotAcceptableException('You are not teacher of this class');
            }
        } else {
            throw new NotFoundException('Class is not Found');
        }
    }

    async joinInvitationLink(joinInvitationLink: JoinInvitationLink, user: Users): Promise<any> {
        const { linkId } = joinInvitationLink;
        const aLink = await this.linkRepository.findOne(linkId);
        if (aLink == null) {
            throw new NotFoundException('Invitation Link Not Found');
        }

        if (aLink.isPrivateLink) {
            // private link
            if (Date.now() >= aLink.expiredTime || !this.stringArrUtils.IsInClude(aLink.inviteEmail,user.email.toString())) {
                throw new NotAcceptableException('You are not invited to this class or invite link is expired');
            }
        }

        if (aLink.emailConstrain != null && !user.email.toString().includes(aLink.emailConstrain.toString())) {
            throw new NotAcceptableException('You are not invited to this class or invite link is expired');
        }

        const aClass = await this.classService.getAClass(aLink.classId);
        if (aClass == null) {
            throw new NotFoundException('This class was deleted');
        }
        if (user.studentId && aClass.students && this.stringArrUtils.IsInClude(aClass.students, user.studentId.toString()) ||
            this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString())) {
            throw new NotAcceptableException('You have already joined i nthis class');
        }


        if (user.studentId) {
            // student join
            if (aClass.students == null) {
                aClass.students = [];
            }
            aClass.students.push(user.studentId);
        }
        else {
            // teacher join:
            aClass.teachers.push(user._id);
        }
        this.classService.saveAClass(aClass);
        return Promise.resolve({
            success: true,
            classId: aClass._id,
        });
    }

    async checkAuthAcceplink(linkId: string, user: Users): Promise<any> {
        const aLink = await this.linkRepository.findOne(linkId);
        console.log("checkAuthAcceplink", linkId, aLink, user);
        if (aLink == null) {
            throw new NotFoundException('Invitation Link Not Found');
        }
        const email = user.email.toString();
        if (aLink.emailConstrain && email.includes(aLink.emailConstrain.toString())) {
            return Promise.resolve({
                success: true,
                isAccepted: true,
            });
        }
        if (aLink.inviteEmail && this.stringArrUtils.IsInClude(aLink.inviteEmail, email)) {
            return Promise.resolve({
                success: true,
                isAccepted: true,
            });
        }

        if (!aLink.emailConstrain && !aLink.inviteEmail) {
            return Promise.resolve({
                success: true,
                isAccepted: true,
            });
        }
        
        return Promise.resolve({
            success: true,
            isAccepted: false,
        })

    }
}
