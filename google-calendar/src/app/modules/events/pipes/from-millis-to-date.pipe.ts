import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'fromMillisToDate'
})
export class FromMillisToDatePipe implements PipeTransform {

  transform(millis:number){
    return DateTime.fromMillis(millis)
  }

}
