export interface UpdateEventDTO {
    uid:string
    startDate: number
    endDate: number
    title: string
    description: string
    rrule?: string | null

    rruleUid?: string | null
    all:boolean

}