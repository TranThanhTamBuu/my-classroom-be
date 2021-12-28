import { Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignments } from './assignment.entity';
import { Repository } from 'typeorm';
import { ClassesService } from 'src/classes/classes.service';
import { Users } from 'src/auth/users.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ModifyAssignmentDto } from './dto/modify-assignment.dto';
import { Classes } from 'src/classes/classes.entity';
import { SetListGradeDto } from './dto/set-list-grade.dto';
import { SetFinalizedDto } from './dto/set-finalized-assignment.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class AssignmentsService {
    constructor(
        @InjectRepository(Assignments) private assignmentsRepository: Repository<Assignments>,
        private classesService: ClassesService,
    ) { }

    async getAllAssignmentOfClass(user: Users, classId: string): Promise<Assignments[]> {
        const aClass = await this.classesService.getAClass(classId);
        if (user.studentId && aClass.students.includes(user.studentId.toString()) || aClass.teachers.includes(user._id.toString())) {
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
        if (!aClass.teachers.includes(user._id.toString()))
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
        if (!aClass.teachers.includes(user._id.toString())) {
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
        if (!aClass.teachers.includes(user._id.toString()))
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
                // Neu thay doi total point thi xoa het diem cu
                if (anAssignment.totalPoint != val.totalPoint && anAssignment.gradeList) {
                    anAssignment.gradeList = {};
                }
                anAssignment.totalPoint = val.totalPoint;
                anAssignment.expiredTime = val.expiredTime;
                anAssignment.position = val.position;
                anAssignment.isFinalized = val.isFinalized;
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
                    isFinalized: val.isFinalized,
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
        const { assignmentId, listGrade, isImport, isFinalized } = setListGradeDto;
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }
        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!aClass.teachers.includes(user._id.toString())) {
            throw new UnauthorizedException();
        }

        if (isImport || anAssignment.gradeList === null) {
            anAssignment.gradeList = {};
        }

        listGrade.forEach(item => {
            anAssignment.gradeList[item.studentId] = item.grade;
        });
        anAssignment.isFinalized = isFinalized;
        return this.assignmentsRepository.save(anAssignment);
    }

    async setFinalized(user: Users, input: SetFinalizedDto) {
        const { assignmentId, isFinalized } = input;
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }
        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!aClass.teachers.includes(user._id.toString())) {
            throw new UnauthorizedException();
        }
        anAssignment.isFinalized = isFinalized;
        return this.assignmentsRepository.save(anAssignment);
    }

    async getListGrade(user: Users, assignmentId: string) {
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }

        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!aClass.teachers.includes(user._id.toString())) {
            throw new UnauthorizedException();
        }

        var res = [];
        aClass.listStudent.forEach(val => {
            const grade = anAssignment.gradeList[val.id] ? anAssignment.gradeList[val.id] : null;
            const cmt = anAssignment.commentList[val.id] ? anAssignment.commentList[val.id] : null;
            var newItem = {
                studentId: val.id,
                fullName: val.name
            };
            newItem[anAssignment.title] = grade;
            newItem[anAssignment.title + '_cmt'] = cmt;
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
        if (!(aClass.students && user.studentId && aClass.students.includes(user.studentId.toString()))) {
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
        if (!aClass.teachers.includes(user._id.toString())) {
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
        if (aClass === null) {
            throw new NotFoundException();
        }
        if (!aClass.teachers.includes(user._id.toString())) {
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
        var res = [];
        var maxPoint = {};
        if (aClass.listStudent) {
            aClass.listStudent.forEach(val => {
                res.push({
                    StudentId: val.id,
                    FullName: val.name,
                });
            });
        }
        listAssignments.forEach(assigment => {
            const aBool = assigment.gradeList != null;
            maxPoint[assigment.title] = {
                point: assigment.totalPoint,
                id: assigment._id
            }
            for (let temp of res) {
                temp[assigment.title] = (aBool && assigment.gradeList[temp.StudentId]) ? assigment.gradeList[temp.StudentId] : null;
                temp[assigment.title + '_cmt'] = (aBool && assigment.commentList[temp.StudentId]) ? assigment.commentList[temp.StudentId] : null;
            }
        });
        return {
            data: res,
            maxPoint: maxPoint
        };
    }

    async getFullGradeOfStudent(user: Users, classId: string) {
        const aClass = await this.classesService.getAClass(classId);
        if (aClass === null) {
            throw new NotFoundException();
        }
        if (!(aClass.students && user.studentId && aClass.students.includes(user.studentId.toString()))) {
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
            if (val.isFinalized)
                res[val.title] = val.gradeList[res.studentId] ? val.gradeList[res.studentId] : null;
            else
                res[val.title] = null;
            
            res[val.title + '_cmt'] = val.commentList[res.studentId] ? val.commentList[res.studentId] : null;
        })
        return {
            data: res,
        }
    }

    async studentAddComment(user: Users, input: AddCommentDto) {
        const { assignmentId, comment } = input;
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }

        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!(aClass.students && user.studentId && aClass.students.includes(user.studentId.toString()))) {
            throw new NotAcceptableException();
        }
        anAssignment.commentList[user.studentId.toString()] = comment;
        await this.assignmentsRepository.save(anAssignment);
        return true;
    }

}
