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
import { AddReviewRequestDto } from './dto/add-comment.dto';
import { TeacherReviewRequest } from './dto/update-grade-review.dto';
import { StudentUpdateReviewRequestDto } from './dto/student-update-review.dto';
import { NotificationService } from 'src/notification/notification.service';
import {AuthService} from 'src/auth/auth.service';

@Injectable()
export class AssignmentsService {
    constructor(
        @InjectRepository(Assignments) private assignmentsRepository: Repository<Assignments>,
        private classesService: ClassesService,
        private notificationService: NotificationService,
        private authService: AuthService,
    ) { }

    async getAllAssignmentOfClass(user: Users, classId: string): Promise<Assignments[]> {
        const aClass = await this.classesService.getAClass(classId);
        if ((user.studentId && aClass.students.includes(user.studentId.toString())) || aClass.teachers.includes(user._id.toString()) || user.isAdmin) {
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
                isFinalized: val.isFinalized,
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
                    isFinalized: val.isFinalized ? val.isFinalized : false,
                    gradeList: {},
                    reviewRequestList: {},
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
        const listStudent = await this.authService.getListUserByStuId(aClass.students);
        if (isImport || anAssignment.gradeList === null) {
            anAssignment.gradeList = {};
        }

        listGrade.forEach(item => {
            anAssignment.gradeList[item.studentId] = item.grade;
        });
        anAssignment.isFinalized = isFinalized;
        if (anAssignment.isFinalized) {
            listStudent.forEach(val => {
                this.notificationService.createAndSendNotification({
                    user: val,
                    receivedFromUser: user,
                    description: anAssignment.title + ' is marked as finalized by ' + user.name,
                })
            })
        }
        return this.assignmentsRepository.save(anAssignment);
    }

    async getListGrade(user: Users, assignmentId: string) {
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }

        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!aClass.teachers.includes(user._id.toString()) && !user.isAdmin) {
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
        if (!(aClass.students && user.studentId && aClass.students.includes(user.studentId.toString()))) {
            throw new NotAcceptableException();
        }

        return {
            grade: (anAssignment.gradeList[user.studentId.toString()] && anAssignment.isFinalized) ? anAssignment.gradeList[user.studentId.toString()] : null
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
                fullName: val.name,
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
                id: assigment._id,
                index: assigment.position,
                isFinalized: assigment.isFinalized,
            }
            for (let temp of res) {
                temp[assigment.title] = (aBool && assigment.gradeList[temp.StudentId]) ? assigment.gradeList[temp.StudentId] : null;
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
        var assigmentIndex = {};
        listAssignments.forEach(val => {
            assigmentIndex[val.title] = val.position;
            var temp = {
                id: val._id,
                name: val.title,
                isFinalized: val.isFinalized,
                maxPoint: val.totalPoint,
                isReviewRequest : val.reviewRequestList[user.studentId] ? true : false,
            };
            if (val.isFinalized)
                temp['studentPoint'] = val.gradeList[res.studentId] ? val.gradeList[res.studentId] : null;
            else
                temp['studentPoint'] = null;
            res[val.title] = temp;
        })
        return {
            data: res,
            assignmentIndex: assigmentIndex
        }
    }

    async studentAddReviewRequest(user: Users, input: AddReviewRequestDto) {
        const { assignmentId, studentComment, expectedGrade } = input;
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }
        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!(aClass.students && user.studentId && aClass.students.includes(user.studentId.toString()))) {
            throw new NotAcceptableException();
        }
        if (anAssignment.reviewRequestList[user.studentId.toString()] && anAssignment.reviewRequestList[user.studentId.toString()].isFinal) {
            throw new NotAcceptableException();
        }
        const acommnet = {
            comment: studentComment,
            time: Math.floor(Date.now() / 1000),
        }
        const commentList: any = [];
        commentList.push(acommnet);
        const temp = {
            studentComment: commentList,
            currentGrade: anAssignment.gradeList[user.studentId.toString()],
            expectedGrade: expectedGrade,
            studentId: user.studentId.toString(),
            isFinal: false,
            newGrade: undefined,
            teacherComment: [],
        };
        anAssignment.reviewRequestList[user.studentId.toString()] = temp;
        await this.assignmentsRepository.save(anAssignment);
        // send noti to teacher:
        const listTeacher = await this.authService.getListUser(aClass.teachers);
        listTeacher.forEach(val => {
            this.notificationService.createAndSendNotification({
                user: val,
                receivedFromUser: user,
                description: anAssignment.title + ': You receive a grade review from ' + user.name,
            })
        })
        return temp;
    }

    async teacherReviewRequest(user: Users, input: TeacherReviewRequest) {
        const { studentId, assignmentId, newGrade, comment, markAsFinal } = input;
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }
        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!aClass.teachers.includes(user._id.toString())) {
            throw new NotAcceptableException();
        }
        if (!anAssignment.reviewRequestList[studentId]) {
            throw new NotFoundException();
        }
        if (newGrade) {
            anAssignment.reviewRequestList[studentId].newGrade = newGrade;
        }
        const student = await this.authService.getListUserByStuId([studentId]);
        var description = '';
        if (comment) {
            const acommnet = {
                comment: comment,
                time: Math.floor(Date.now() / 1000),
                teacherId: user._id,
            }
            anAssignment.reviewRequestList[studentId].teacherComment.push(acommnet);
            description = anAssignment.title + ": You receive a comment from teacher: " + user.name;
        }
        if (markAsFinal) {
            anAssignment.reviewRequestList[studentId].isFinal = true;
            anAssignment.gradeList[studentId] = anAssignment.reviewRequestList[studentId].newGrade ? anAssignment.reviewRequestList[studentId].newGrade : anAssignment.reviewRequestList[studentId].currentGrade;
            description = anAssignment.title + ": Your comment is marked as final by: " + user.name;
        }
        this.notificationService.createAndSendNotification({
            user: student[0],
            receivedFromUser: user,
            description: description,
        });
        await this.assignmentsRepository.save(anAssignment);
        return true;
    }

    async getListReviewRequest(user: Users, assignmentId: string) {
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }
        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!user.studentId) {
            if (!aClass.teachers.includes(user._id.toString())) {
                throw new NotAcceptableException();
            }
            return {
                data: anAssignment.reviewRequestList
            }
        } else {
            if (!(aClass.students && user.studentId && aClass.students.includes(user.studentId.toString()))) {
                throw new NotAcceptableException();
            }
            if (anAssignment.reviewRequestList[user.studentId.toString()]) {
                return {
                    data: anAssignment.reviewRequestList[user.studentId.toString()]
                }
            } else {
                return {
                    data: {}
                }
            }
        } 
    }

    async studentUpdateReview(user: Users, input: StudentUpdateReviewRequestDto) {
        const { assignmentId, studentComment, expectedGrade } = input;
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }
        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!(aClass.students && user.studentId && aClass.students.includes(user.studentId.toString()))) {
            throw new NotAcceptableException();
        }
        if (!anAssignment.reviewRequestList[user.studentId.toString()]) {
            throw new NotFoundException();
        }
        if (studentComment) {
            const acommnet = {
                comment: studentComment,
                time: Math.floor(Date.now() / 1000),
            }
            anAssignment.reviewRequestList[user.studentId.toString()].studentComment.push(acommnet);
        }
        if (expectedGrade) {
            anAssignment.reviewRequestList[user.studentId.toString()].expectedGrade = expectedGrade;
        }
        await this.assignmentsRepository.save(anAssignment);
        // send noti to teacher:
        const listTeacher = await this.authService.getListUser(aClass.teachers);
        listTeacher.forEach(val => {
            this.notificationService.createAndSendNotification({
                user: val,
                receivedFromUser: user,
                description: anAssignment.title + ': A revire request is updated by ' + user.name,
            })
        });
        return true;
    }

    async setFinalized(user: Users, assignmentId: string, isFinalized: boolean) {
        const anAssignment = await this.assignmentsRepository.findOne(assignmentId);
        if (!anAssignment) {
            throw new NotFoundException();
        }
        const aClass = await this.classesService.getAClass(anAssignment.classId);
        if (!aClass.teachers.includes(user._id.toString())) {
            throw new NotAcceptableException();
        }
        anAssignment.isFinalized = isFinalized;
        await this.assignmentsRepository.save(anAssignment);
        return true;
    }

}
