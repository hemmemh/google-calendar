import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventSchema } from './event.schema';
import { IsEmail } from 'class-validator';


@Entity()
export class UserSchema {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => EventSchema, (event) => event.user, { cascade: true })
  events: EventSchema[];

 
}
