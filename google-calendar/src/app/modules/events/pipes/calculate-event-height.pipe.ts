import { Pipe, PipeTransform } from '@angular/core';
import { EventModel } from '../../../models/event.model';
import { DateTime } from 'luxon';


@Pipe({
  name: 'calculateEventHeight'
})
export class CalculateEventHeightPipe implements PipeTransform {

  transform(event:  EventModel): number {
 
    if (event.startDate === event.endDate) return 540

    const startDate = DateTime.fromMillis(+event.startDate); 
    const endDate = DateTime.fromMillis(+event.endDate);    
    let duration = endDate.diff(startDate, 'minutes').as('minutes'); 
    return duration;  
  }

}
