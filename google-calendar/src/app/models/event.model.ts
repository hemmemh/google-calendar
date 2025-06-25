import { User } from "./user.model";

export interface EventModel {
  uid: string;
  startDate: number
  endDate: number
  title: string
  description: string
  user: User
  loading?:boolean
  firstPart?:boolean 
  secondPart?:boolean 
  isFullDay:boolean
  rrule: string | null
  rruleUid: string | null

}