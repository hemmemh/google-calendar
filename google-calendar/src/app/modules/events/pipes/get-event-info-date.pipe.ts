import { Pipe, PipeTransform } from '@angular/core';
import { EventModel } from '../../../models/event.model';
import { DateTime, Interval } from 'luxon';

@Pipe({
  name: 'getEventInfoDate'
})
export class GetEventInfoDatePipe implements PipeTransform {

  transform(event:EventModel) {
    const start = DateTime.fromMillis(event.startDate)
    const end = DateTime.fromMillis(event.endDate)

    const interval = Interval.fromDateTimes(start, end);
    const duration = interval.toDuration(['hours', 'minutes']).as('hours');

    if (duration > 24) {
      return `${start.toFormat('HH:mm')}, ${start.toFormat('dd.MM.yyyy')} — ${end.toFormat('HH:mm')}, ${end.toFormat('dd.MM.yyyy')}`;
    } else {
      return `${start.toFormat('EEEE, dd MMMM, HH:mm')} — ${end.toFormat('HH:mm')}`;
    }
  }

}
