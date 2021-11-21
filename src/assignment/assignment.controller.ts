import { Controller, Post, Get, Body, UseGuards, Req, Param, Delete, Put } from '@nestjs/common';
import { AssignmentsService } from './assignment.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ModifyAssignmentDto } from './dto/modify-assignment.dto';

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
        return this.assignmentsService.createAssignment(user, createAssignmentDto);
    }

    @Delete('/:id')
    async deleteAnAssignment(@Req() req, @Param('id') id: string) {
        const { user } = req;
        return this.assignmentsService.deleteAssignment(user, id);
    }

    @Put()
    async updateAssignment(@Req() req, @Body() modifyAssignmentDto: ModifyAssignmentDto) {
        const { user } = req;
        return this.assignmentsService.modifyAssignment(user, modifyAssignmentDto);
    }
}
