import { Pipe, PipeTransform } from '@angular/core';
import { EventModel } from '../../../models/event.model';

@Pipe({
  name: 'getFullDayEvents'
})
export class GetFullDayEventsPipe implements PipeTransform {

  transform(events:EventModel[]) {
    return events.filter(el => el.isFullDay)
  }

}
