import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id: string;

  @Column()
  userId: string;

  @Column()
  receivedFromUserId: string;

  @Column()
  description: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;
}
