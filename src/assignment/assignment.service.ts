import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignments } from './assignment.entity';
import { Repository } from 'typeorm';
import { ClassesService } from 'src/classes/classes.service';
import { Users } from 'src/auth/users.entity';
import { StringArraryUtils } from 'src/Utils/StringArrayInclude';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ModifyAssignmentDto } from './dto/modify-assignment.dto';
import { Classes } from 'src/classes/classes.entity';

@Injectable()
export class AssignmentsService {
    constructor(
        @InjectRepository(Assignments) private assignmentsRepository: Repository<Assignments>,
        private classesService: ClassesService,
        private stringArrUtils: StringArraryUtils,
    ) { }

    async getAllAssignmentOfClass(user: Users, classId: string): Promise<Assignments[]> {
        const aClass = await this.classesService.getAClass(classId);
        if (user.studentId && this.stringArrUtils.IsInClude(aClass.students, user.studentId.toString()) || this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString())) {
            return this.assignmentsRepository.find({
                where: {
                    _id: {
                        $in: aClass.assignments
                    }
                }
            });
        } else {
            throw new UnauthorizedException();
        }
    }

    async createAssignment(user: Users, createDto: CreateAssignmentDto): Promise<Assignments>{
        const { title, description, totalPoint, expiredTime, classId } = createDto;
        const aClass = await this.classesService.getAClass(classId);
        if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString())) 
            throw new UnauthorizedException();
        
        
        const assignTime = Date.now();
        const newAssignment = this.assignmentsRepository.create({
            title,
            description,
            assignTime: assignTime,
            expiredTime: expiredTime,
            totalPoint: totalPoint,
            teacherName: user.name,
            teacherId: user._id,
            classId
        });
        var temp = await this.assignmentsRepository.save(newAssignment);
        if (aClass.assignments)
            aClass.assignments.push(temp._id);
        else
            aClass.assignments = [temp._id];
        this.classesService.saveAClass(aClass);
        return temp;
    }

    async deleteAssignment(user: Users, assignmentId: string): Promise<Classes> {
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }

        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString())) {
            throw new UnauthorizedException();
        }
        if (aClass.assignments)
            aClass.assignments = aClass.assignments.filter(function (value) {
                return value.toString() !== assignmentId;
            });

        return this.classesService.saveAClass(aClass);
    }

    async modifyAssignment(user: Users, modifyDto: ModifyAssignmentDto): Promise<Assignments> {
        const { assignmentId, title, description, totalPoint, expiredTime, classId } = modifyDto;
        const aClass = await this.classesService.getAClass(classId);
        if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id))
            throw new UnauthorizedException();
        
        var anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment || anAssignment.classId !== classId)
            throw new NotFoundException();
        
        anAssignment.title = title;
        anAssignment.description = description;
        anAssignment.totalPoint = totalPoint;
        anAssignment.expiredTime = expiredTime;
        return this.assignmentsRepository.save(anAssignment);
    }
}
