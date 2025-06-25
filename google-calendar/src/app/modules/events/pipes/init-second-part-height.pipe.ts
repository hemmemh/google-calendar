import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'initSecondPartHeight'
})
export class InitSecondPartHeightPipe implements PipeTransform {

  transform(startDate:number, endDate:number) {
    const start = DateTime.fromMillis(startDate);
    const end = DateTime.fromMillis(endDate);
    if(end.hasSame(start.plus({ days: 1 }), 'day')){
      const startDay = end.startOf('day')
      return end.diff(startDay, 'minutes').as('minutes');
    }
    return 0
  }

}
