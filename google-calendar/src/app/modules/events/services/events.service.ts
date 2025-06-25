import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom } from 'rxjs';
import { EventModel } from '../../../models/event.model';
import { CreateEventDTO } from '../../../dtos/create-event.dto';
import { UpdateEventDTO } from '../../../dtos/update-event.dto';
import { EventsApiService } from '../../../api/events.api.service';
import { GetEventsByParamsDTO } from '../../../dtos/get-events-by-params.dto';
import {  hoursAndMinutesByReportDate} from '../helpers/time.helpers';
import { EventHistoryService } from './event-history.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { EventsStorageService } from './events-storage.service';
import { EventChange } from '../../../interfaces/event-change';


@Injectable()
export class EventsService {

  constructor(
    private eventsApiService:EventsApiService,
    private eventsStorageService:EventsStorageService,
    private eventHistoryService:EventHistoryService,
    private snackBar:MatSnackBar
   ) { }

 

async  create(dto:CreateEventDTO){
      const events = await firstValueFrom(this.eventsApiService.create(dto)) 
      for(const event of events ){
        this.eventsStorageService.add(event.redo.obj)
       }
       this.eventHistoryService.setUndoArray(events)
      this.eventHistoryService.redoArray$.next([])
      return events
 }



 async update(dto:UpdateEventDTO){
      const events = await firstValueFrom(this.eventsApiService.update(dto)) 

      if(dto.all && dto.rruleUid){
        this.onAllUpdates(dto, events)
      }
      if(!dto.rruleUid && dto.rrule){
         this.onFirstRruleUpdate(events)
      }

      if(!dto.all){
        this.onOneUpdate(events)
      }
      

      this.eventHistoryService.setUndoArray(events)
      this.eventHistoryService.redoArray$.next([])
       return events
     
 }


    private onAllUpdates(dto:UpdateEventDTO, events: EventChange[]){
  this.eventsStorageService.filterByRrule(dto.rruleUid as string);

  for(const event of events ){
    this.eventsStorageService.add(event.redo.obj)
   }
 }

    private onFirstRruleUpdate(events: EventChange[]){
  this.eventsStorageService.replace({...events[0].redo.obj, loading:false});
  events.shift()
  for(const event of events ){
    this.eventsStorageService.add(event.redo.obj)
   }
 }

    private onOneUpdate(events: EventChange[]){
  for(const event of events ){
    this.eventsStorageService.replace({...event.redo.obj, loading:false});
   }
 }

 async delete(uid:string, all:boolean){
  const events = await firstValueFrom(this.eventsApiService.delete(uid, all)) 
  const rruleUid  = events[0].undo.obj.rruleUid
  this.eventHistoryService.setUndoArray(events)
  this.eventHistoryService.redoArray$.next([])
  if(all && rruleUid){
    this.eventsStorageService.filterByRrule(rruleUid)
  }else{
  this.eventsStorageService.filter(uid)
  }

  
}

async getByParams(startDate:number, endDate:number){
  const userUid = localStorage.getItem('userId')
  if(!userUid) return
  const dto:GetEventsByParamsDTO = {
    startDate:String(startDate),
    endDate:String(endDate),
    userUid
  }
 let events =  await firstValueFrom(this.eventsApiService.getByParams(dto))
 const notFullDayEvents = events.filter(el => !el.isFullDay)
 const secondPartEvents:EventModel[] = []
 for(const event of notFullDayEvents){

  if(DateTime.fromMillis(event.endDate).hasSame(DateTime.fromMillis(event.startDate).plus({days:1}), 'day' )){
       
          
    const newEvent:EventModel = {
     ...event,
     secondPart:true
    }


    secondPartEvents.push(newEvent)

    event.firstPart = true
 }
 }

 if(secondPartEvents.length !== 0){
 events =  [...events, ...secondPartEvents].sort((a, b) => a.startDate - b.startDate)
 }
 this.eventsStorageService.Events = events 
}

async onEventDrop(
  startDate:DateTime, endDate:DateTime, event:EventModel
) {
  //let startPos = startDateInMinutes(eventData.container.data.date, eventData.distanceY)


  if (event.startDate === startDate.toMillis() && event.endDate === endDate.toMillis()){
    return hoursAndMinutesByReportDate(event)
  }
      await  this.actionOnDropReport(event, startDate.toMillis(), endDate.toMillis())
  return hoursAndMinutesByReportDate({...event, startDate:startDate.toMillis(), endDate:endDate.toMillis()})
}

async  actionOnDropReport(
  event:EventModel,
  startDate:number = event.startDate,
  endDate:number = event.endDate){

  try {
    this.eventsStorageService.replace({...event, startDate,endDate, loading:true});
    await  this.update({...event, startDate,endDate, all:false})
  
 
  } catch (error) {
    this.eventsStorageService.replace(event);
    this.snackBar.open('Нет доступа к данному отчёту', undefined,{
      duration: 2000
    });
    
  }

  }

  async  onResizeEnd(pos:{startDate:DateTime,endDate:DateTime}, event:EventModel) {
    if (event.startDate === pos.startDate.toMillis() && event.endDate === pos.endDate.toMillis()) {
      return hoursAndMinutesByReportDate(event)
    }
 
    await this.actionOnResizeEvent(event, pos.startDate.toMillis(), pos.endDate.toMillis(),)
    return hoursAndMinutesByReportDate(event)

  }

  async actionOnResizeEvent(event:EventModel, startDate:number,endDate:number){
    try {
      this.eventsStorageService.replace({...event, startDate, endDate});
      const updated = await this.update({...event, startDate, endDate,  all:false})
      for(const change of updated){
        this.eventsStorageService.replace(change.redo.obj);
      }
    
    } catch (error) {
      this.eventsStorageService.replace(event);
      this.snackBar.open('Нет доступа к данному отчёту', undefined,{
        duration: 2000
      })
   
    }


    }

  


}
