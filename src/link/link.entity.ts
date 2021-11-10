import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class Link {
    @PrimaryColumn()
    @ObjectIdColumn()
    _id: string;

    @Column()
    isPrivateLink: boolean;

    @Column()
    classId: string;

    @Column()
    emailConstrain: string;

    @Column()
    inviteEmail: string[];

    @Column()
    expiredTime: number;
}