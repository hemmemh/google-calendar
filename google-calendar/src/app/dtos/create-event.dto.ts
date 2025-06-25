import { User } from "../models/user.model"

export interface CreateEventDTO {
    startDate: number
    endDate: number
    title: string
    description: string
    user: User
    rrule?: string | null
    rruleUid?: string | null
}