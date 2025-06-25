import { UserSchema } from "src/schemas/User.schema"

export interface CreateEventDTO {
  startDate: number
  endDate: number
  title: string
  description: string
  user: UserSchema
  rrule?: string
}