import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserSchema } from './User.schema';
import { ColumnNumericTransformer } from 'src/tranformers/string-to-number.transform';


@Entity()
export class EventSchema {

  @PrimaryGeneratedColumn("uuid")
  uid: string;

  @Column({type: 'bigint',  transformer: new ColumnNumericTransformer()})

  startDate: number

  @Column({type: 'bigint',  transformer: new ColumnNumericTransformer()})
  endDate: number

  @Column()
  title: string

  @Column({default:null})
  rrule: string

  @Column({type:'uuid', default:null})
  rruleUid: string

  @Column()
  description: string

  @Column({default:false})
  isFullDay: boolean

  @ManyToOne(() => UserSchema, (user) => user.events, { onDelete: 'CASCADE'})
  user: UserSchema

}
