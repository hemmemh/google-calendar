import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import { EventModel } from '../../../models/event.model';

@Pipe({
  name: 'isEventInCuurentDate'
})
export class IsEventInCuurentDatePipe implements PipeTransform {

  transform(events: EventModel[],  day:DateTime, fullDay:boolean) {
    return events.filter(event => 
      DateTime.fromMillis( event.secondPart ? event.endDate :  event.startDate).day === day.day && 
      DateTime.fromMillis(event.secondPart ? event.endDate :event.startDate).month === day.month && 
      DateTime.fromMillis(event.secondPart ? event.endDate :event.startDate).year === day.year && event.isFullDay === fullDay

    )
   
  }

}
