export interface UpdateEventDTO {
  uid:string
  startDate: number
  endDate: number
  title: string
  description: string
  rrule?: string
  rruleUid?: string
  all:boolean
}