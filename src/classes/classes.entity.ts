import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class Classes {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id: string;

  @Column()
  name: string;

  @Column()
  section: string;

  @Column()
  subject: string;

  @Column()
  room: string;

  @Column()
  createdBy: string;

  @Column()
  students: string[];

  @Column()
  teachers: string[];

  @Column()
  assignments: string[];

  @Column()
  gradeList: string;

  @Column()
  listStudent: [
    {
      name: string;
      id: string;
    },
  ];

  @Column()
  isFinalized: boolean;

  @Column({ default: true })
  active: boolean;
}
