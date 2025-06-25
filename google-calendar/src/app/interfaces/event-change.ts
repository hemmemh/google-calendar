import { EventModel } from "../models/event.model"


type Method = 'create' | 'update' | 'delete'

export interface EventChangeObj{
    method:Method,
    obj: EventModel
}

export interface EventChange{
    undo:EventChangeObj,
    redo:EventChangeObj
}


