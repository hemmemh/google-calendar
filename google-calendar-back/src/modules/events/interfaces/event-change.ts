import { EventSchema } from "src/schemas/event.schema"

type Method = 'create' | 'update' | 'delete'


export interface EventChangeObj{
    method:Method,
    obj:EventSchema
}

export interface EventChange{
    undo:EventChangeObj,
    redo:EventChangeObj
}