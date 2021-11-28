import { Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignments } from './assignment.entity';
import { Repository } from 'typeorm';
import { ClassesService } from 'src/classes/classes.service';
import { Users } from 'src/auth/users.entity';
import { StringArraryUtils } from 'src/Utils/StringArrayInclude';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ModifyAssignmentDto } from './dto/modify-assignment.dto';
import { Classes } from 'src/classes/classes.entity';
import { SetListGradeDto } from './dto/set-list-grade.dto';

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
            if (aClass.assignments)
                return this.assignmentsRepository.find({
                    where: {
                        _id: {
                            $in: aClass.assignments
                        }
                    }
                });
            else
                return [];
        } else {
            throw new UnauthorizedException();
        }
    }

    async createAssignments(user: Users, createDto: CreateAssignmentDto): Promise<Assignments[]> {
        const { listAssignment, classId } = createDto;
        const aClass = await this.classesService.getAClass(classId);
        if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString()))
            throw new UnauthorizedException();
        
        
        const assignTime = Date.now();
        var assignments = [this.assignmentsRepository.create()];
        listAssignment.forEach((val) => {
            const newAssignment = this.assignmentsRepository.create({
                title: val.title,
                description: val.description,
                assignTime: assignTime,
                expiredTime: val.expiredTime,
                totalPoint: val.totalPoint,
                teacherName: user.name,
                teacherId: user._id,
                classId,
                position: val.position,
            });
            assignments.push(newAssignment);
        });
        assignments.shift();
        const temp = await this.assignmentsRepository.save(assignments);
        aClass.assignments = [];
        for (let val of temp) {
            aClass.assignments.push(val._id);
        }
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
        var listAssignments = await this.assignmentsRepository.find({
            where: {
                _id: {
                    $in: aClass.assignments
                }
            }
        });
        for (let val of listAssignments) {
            if (val.position > anAssignment.position)
                val.position -= 1;
        }
        this.assignmentsRepository.save(listAssignments);
        return this.classesService.saveAClass(aClass);
    }

    async modifyAssignments(user: Users, modifyDto: ModifyAssignmentDto): Promise<any> {
        const { listAssignment, classId } = modifyDto;
        const aClass = await this.classesService.getAClass(classId);
        if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString()))
            throw new UnauthorizedException();
        
        var newAssignmentList = [this.assignmentsRepository.create()];
        const assignTime = Date.now();
        for (let val of listAssignment) {
            if (val._id) {
                var anAssignment = await this.assignmentsRepository.findOne(val._id);
                if (!anAssignment || anAssignment.classId !== classId)
                    throw new NotFoundException();

                anAssignment.title = val.title;
                anAssignment.description = val.description;
                anAssignment.totalPoint = val.totalPoint;
                anAssignment.expiredTime = val.expiredTime;
                anAssignment.position = val.position;
                newAssignmentList.push(anAssignment);
            } else {
                const newAssignment = this.assignmentsRepository.create({
                    title: val.title,
                    description: val.description,
                    assignTime: assignTime,
                    expiredTime: val.expiredTime,
                    totalPoint: val.totalPoint,
                    teacherName: user.name,
                    teacherId: user._id,
                    classId,
                    position: val.position,
                });
                newAssignmentList.push(newAssignment);
            }
        }
        newAssignmentList.shift();
        const temp = await this.assignmentsRepository.save(newAssignmentList);
        aClass.assignments = [];
        temp.forEach((val) => {
            aClass.assignments.push(val._id);
        })
        this.classesService.saveAClass(aClass);
        return temp;
    }

    async setListGrade(user: Users, setListGradeDto: SetListGradeDto): Promise<Assignments> {
        const { assignmentId, listGrade, isImport } = setListGradeDto;
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }
        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString())) {
            throw new UnauthorizedException();
        }

        if (isImport || anAssignment.gradeList === null) {
            anAssignment.gradeList = {};
        }

        listGrade.forEach(item => {
            anAssignment.gradeList[item.studentId] = item.grade;
        });
        return this.assignmentsRepository.save(anAssignment);
    }

    async getListGrade(user: Users, assignmentId: string) {
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }

        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString())) {
            throw new UnauthorizedException();
        }

        var res = [];
        aClass.listStudent.forEach(val => {
            const grade = anAssignment.gradeList[val.id] ? anAssignment.gradeList[val.id] : null;
            var newItem = {
                studentId: val.id,
                fullName: val.name
            };
            newItem[anAssignment.title] = grade;
            res.push(newItem);
        })
        return {
            data: res
        };
    }

    async getStudentGrade(user: Users, assignmentId: string) {
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }

        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (user.studentId && aClass.students && !this.stringArrUtils.IsInClude(aClass.students, user.studentId.toString())) {
            throw new NotAcceptableException();
        }

        return {
            grade: anAssignment.gradeList[user.studentId.toString()] ? anAssignment.gradeList[user.studentId.toString()] : null
        }
    }

    async getDefaultListGradeJson(user: Users, assignmentId: string) {
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }

        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString())) {
            throw new UnauthorizedException();
        }

        var res = [];
        aClass.listStudent.forEach(val => {
            var newItem = {
                studentId: val.id,
                fullName: val.name
            };
            newItem[anAssignment.title] = null;
            res.push(newItem);
        })
        return {
            data: res
        };
    }

    async getFullGradeList(user: Users, classId: string) {
        const aClass = await this.classesService.getAClass(classId);
        if (!this.stringArrUtils.IsInClude(aClass.teachers, user._id.toString())) {
            throw new UnauthorizedException();
        }
        if (aClass.assignments == null) {
            aClass.assignments = [];
        }
        const listAssignments = await this.assignmentsRepository.find({
            where: {
                _id: {
                    $in: aClass.assignments
                }
            }
        });
        var res = [];
        aClass.listStudent.forEach(val => {
            res.push({
                StudentId: val.id,
                FullName: val.name,
            });
        });
        listAssignments.forEach(assigment => {
            const aBool = assigment.gradeList != null;
            for (let temp of res) {
                temp[assigment.title] = (aBool && assigment.gradeList[temp.StudentId]) ? assigment.gradeList[temp.StudentId] : null;
            }
        });
        return {
            data: res
        };
    }

    async getFullGradeOfStudent(user: Users, classId: string) {
        const aClass = await this.classesService.getAClass(classId);
        if (user.studentId && aClass.students && !this.stringArrUtils.IsInClude(aClass.students, user.studentId.toString())) {
            throw new NotAcceptableException();
        }
        if (aClass.assignments == null) {
            aClass.assignments = [];
        }
        const listAssignments = await this.assignmentsRepository.find({
            where: {
                _id: {
                    $in: aClass.assignments
                }
            }
        });
        var res = {
            studentId: user.studentId,
            FullName: user.name,
        };
        listAssignments.forEach(val => {
            res[val.title] = val.gradeList[res.studentId] ? val.gradeList[res.studentId] : null;
        })
        return {
            date: res,
        }
    }

}
