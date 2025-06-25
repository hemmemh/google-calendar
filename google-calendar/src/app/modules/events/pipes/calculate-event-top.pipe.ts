import { Pipe, PipeTransform } from '@angular/core';
import { EventModel } from '../../../models/event.model';
import { DateTime } from 'luxon';


@Pipe({
  name: 'calculateEventTop'
})
export class CalculateEventTopPipe implements PipeTransform {

  transform(event: EventModel) {
    
    const startDate = DateTime.fromMillis(+event.startDate);  
    const startInMinutes = startDate.hour * 60 + startDate.minute; 
    return event.secondPart ? startInMinutes - 1440   + "px" : startInMinutes + "px"; 
  }

}
