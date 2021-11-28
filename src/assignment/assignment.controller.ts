import { Controller, Post, Get, Body, UseGuards, Req, Param, Delete, Put } from '@nestjs/common';
import { AssignmentsService } from './assignment.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ModifyAssignmentDto } from './dto/modify-assignment.dto';
import { SetListGradeDto } from './dto/set-list-grade.dto';

@Controller('assignment')
@UseGuards(AuthGuard())
export class AssignmentsController {
    constructor(private assignmentsService: AssignmentsService) { }

    @Get('/:id')
    async getAllAssignmentOfClass(@Req() req, @Param('id') id: string) {
        const { user } = req;
        return this.assignmentsService.getAllAssignmentOfClass(user, id);
    }

    @Post()
    async createAnAssignment(@Req() req, @Body() createAssignmentDto: CreateAssignmentDto) {
        const { user } = req;
        return this.assignmentsService.createAssignments(user, createAssignmentDto);
    }

    @Delete('/:id')
    async deleteAnAssignment(@Req() req, @Param('id') id: string) {
        const { user } = req;
        return this.assignmentsService.deleteAssignment(user, id);
    }

    @Put()
    async updateAssignment(@Req() req, @Body() modifyAssignmentDto: ModifyAssignmentDto) {
        const { user } = req;
        return this.assignmentsService.modifyAssignments(user, modifyAssignmentDto);
    }

    // set/update điểm của student, nếu isImport : true thì xóa hết dự liệu điểm cũ dùng cái mới, nếu false thì chỉ sửa các điểm của student id gửi lên -> truyền list {studentId, grade}
    @Put('/grade')
    async setListGrade(@Req() req, @Body() setListGradeDto: SetListGradeDto) {
        const { user } = req;
        return this.assignmentsService.setListGrade(user, setListGradeDto);
    }

    // lấy list điểm của 1 assginment -> trả về {data} : data format như file xlsx khi dùng sheetjs chuyển về json
    @Get('/grade/:id')
    async getGradeJson(@Req() req, @Param('id') AssignmentId: string) {
        const { user } = req;
        return this.assignmentsService.getListGrade(user, AssignmentId);
    }


    // lấy list điểm của 1 student trong lớp -> trả về {data} : data format như file xlsx khi dùng sheetjs chuyển về json có tất cả các cột điểm
    @Get('/grade/student/:id')
    async getStudentGradeJson(@Req() req, @Param('id') classId: string) {
        const { user } = req;
        return this.assignmentsService.getFullGradeOfStudent(user, classId);
    }

    // lấy template bảng điểm của 1 assigment -> trả về {data} : data format như file xlsx khi dùng sheetjs chuyển về json có tất cả sinh viên và 1 cột điểm
    @Get('/grade/default/:id')
    async getDefaultGradeTemplateJson(@Req() req, @Param('id') AssignmentId: string) {
        const { user } = req;
        return this.assignmentsService.getDefaultListGradeJson(user, AssignmentId);
    }

    // lấy full điểm của tất cả các học sinh trong lớp -> trả về {data} : data format như file xlsx khi dùng sheetjs chuyển về json có tất cả các học sinh và cột điểm
    @Get('/grade/class/:id')
    async getClassFullGradeJson(@Req() req, @Param('id') ClassId: string) {
        const { user } = req;
        return this.assignmentsService.getFullGradeList(user, ClassId);
    }
}
