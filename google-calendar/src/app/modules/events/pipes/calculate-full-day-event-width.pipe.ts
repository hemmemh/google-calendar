import { Inject, Pipe, PipeTransform } from '@angular/core';
import { EventModel } from '../../../models/event.model';
import { DOCUMENT } from '@angular/common';
import { DateTime } from 'luxon';

@Pipe({
  name: 'calculateFullDayEventWidth'
})
export class CalculateFullDayEventWidthPipe implements PipeTransform {

  constructor(@Inject(DOCUMENT) private document: Document){}
  
  transform(event:EventModel, days:number) {
      const container = this.document.querySelector('.full-day-events-container') as HTMLElement
      if(!container) return `0%`
      const containerWidth = container.offsetWidth
      const dayContainerWidth = Math.round( containerWidth / days) / containerWidth * 100
      return Math.ceil((event.endDate - event.startDate) / 86400000) * dayContainerWidth + '%'

  }

}
