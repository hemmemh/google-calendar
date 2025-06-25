import { Inject, Pipe, PipeTransform } from '@angular/core';
import { EventModel } from '../../../models/event.model';
import { DateTime } from 'luxon';
import { DOCUMENT } from '@angular/common';

@Pipe({
  name: 'calculateFullDayEventLeft'
})
export class CalculateFullDayEventLeftPipe implements PipeTransform {

  constructor(@Inject(DOCUMENT) private document: Document){}

  transform(event:EventModel,firstDay:DateTime, days:number) {
    const container = this.document.querySelector('.full-day-events-container') as HTMLElement
    if(!container) return `0%`
    const containerWidth = container.offsetWidth
    const dayContainerWidth = Math.round( containerWidth / days) / containerWidth * 100
     const diff = Math.round((event.startDate - firstDay.toMillis()) / 86400000 )
     
    return dayContainerWidth * diff  + '%'


  }

}
