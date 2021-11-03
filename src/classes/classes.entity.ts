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
}
