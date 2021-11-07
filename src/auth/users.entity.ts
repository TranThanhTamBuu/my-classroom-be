import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  photo: string;

  @Column()
  name: string;

  @Column()
  studentId: string;
}
