import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class Assignments {
    @PrimaryColumn()
    @ObjectIdColumn()
    _id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    assignTime: number;

    @Column()
    expiredTime: number;

    @Column()
    totalPoint: number;

    @Column()
    teacherName: string;

    @Column()
    teacherId: string;

    @Column()
    classId: string;

    @Column()
    position: number;

    @Column()
    gradeList: object;
}
