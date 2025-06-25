import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../../../models/event.model';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class EventsStorageService {

  constructor() { }


   private events = new BehaviorSubject<EventModel[]>([])
    public events$ = this.events.asObservable()
  
    get Events(){
      return this.events.value
    }
  
    set Events(data:EventModel[]){
      this.events.next(data)
    }
  
  
    add(event:EventModel){
       const events = this.Events
       events.push(event)
       this.Events = events
    }
  
    filter(uid:string){
      const events = this.Events
      this.Events = events.filter(el => el.uid !== uid)
    }
  
    replace(event:EventModel){
      let events = this.Events
      console.log('JJJ', events);
      
      const finded  =  events.filter(el => el.uid == event.uid)
      console.log('finded', finded);
      
     events =  events.filter(el => el.uid !== event.uid)

      if(finded.length !== 0){

        
        if(DateTime.fromMillis(event.endDate).hasSame(DateTime.fromMillis(event.startDate).plus({days:1}), 'day' ) && !event.isFullDay){
       
          
           const newEvent:EventModel = {
            ...event,
            secondPart:true
           }
       

           events.push(newEvent)

           event.firstPart = true
        }else{
          event.secondPart = false
        }
        events.push(event)
      }
      console.log('events', event);
      
      this.Events = events
    }

    filterByRrule(rruleUid:string | null){
      const events = this.Events
      console.log('^^^', );
      
      this.Events = events.filter(el =>   el.rruleUid !== rruleUid)
    }



    groupEvents(events: EventModel[]): EventModel[][] {
      const result: EventModel[][] = [];
      let currentGroup: EventModel[] = [];

      for (const event of events) {
        let intersects = false;
    
        if (currentGroup.length === 0) {
          currentGroup.push(event);
        } else {
          for (const groupEvent of currentGroup) {
            const eventStartDate =  event.startDate
            const eventEndDate =   event.endDate
            const newGroupEventStartDate = groupEvent.startDate
            const newGroupEventEndDate =  groupEvent.endDate
         
             
            if (
              eventEndDate > newGroupEventStartDate &&
              eventStartDate < newGroupEventEndDate
            ) {
              intersects = true;
              break;
            }
          }
  
          if (intersects) {
            currentGroup.push(event);
 
            
          } else {
            result.push(currentGroup);
            currentGroup = [event];
          }
        }
      }
  
      if (currentGroup.length > 0) {
      
        result.push(currentGroup);
      }
   
      
  
      
      return result;
    }
}
