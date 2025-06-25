import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'getWeeksCount'
})
export class GetWeeksCountPipe implements PipeTransform {

  transform(date:DateTime): unknown {
  

    const  startOfYear = DateTime.fromObject({ year: date.year, month: 1, day: 1 }) ;
    const  weeksPassed = date.diff(startOfYear, 'weeks').toObject().weeks;

   return `${Math.floor(weeksPassed ?? NaN)} нед.`
  }

}
