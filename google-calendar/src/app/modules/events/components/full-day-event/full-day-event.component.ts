import { ChangeDetectorRef, Component, Input, input, OnInit } from '@angular/core';
import { EventModel } from '../../../../models/event.model';
import { CalculateFullDayEventWidthPipe } from '../../pipes/calculate-full-day-event-width.pipe';
import { CalculateFullDayEventLeftPipe } from '../../pipes/calculate-full-day-event-left.pipe';
import { DateTime } from 'luxon';
import { DraggableFullDayDirective } from '../../directives/draggable-full-day.directive';
import { EventsService } from '../../services/events.service';
import { ResizableHandlerFullDayDirective } from '../../directives/resizable-handler-full-day.directive';
import { ResizableFullDayDirective } from '../../directives/resizable-full-day.directive';
import { FromMillisToDatePipe } from '../../pipes/from-millis-to-date.pipe';

@Component({
  selector: 'app-full-day-event',
  imports: [CalculateFullDayEventWidthPipe, CalculateFullDayEventLeftPipe, DraggableFullDayDirective, ResizableHandlerFullDayDirective, ResizableFullDayDirective, FromMillisToDatePipe],
  templateUrl: './full-day-event.component.html',
  styleUrl: './full-day-event.component.scss'
})
export class FullDayEventComponent implements OnInit{


  constructor(
    private eventService: EventsService,
    private cdr:ChangeDetectorRef,


  ) {}


  startDate = DateTime.now()
  endDate = DateTime.now()
  @Input({required:true}) event!:EventModel
  @Input({required:true}) days!:number
  @Input({required:true}) firstDate!:DateTime
  @Input({required:true}) top!:number

  ngOnInit(): void {
     this.startDate = DateTime.fromMillis(this.event.startDate) as DateTime
     this.endDate = DateTime.fromMillis(this.event.endDate) as DateTime
  }

  async onEventDrop({startDate, endDate}:{startDate:DateTime, endDate:DateTime}) {
      await this.eventService.onEventDrop(startDate, endDate, this.event)
    //this.loader = false
    this.cdr.markForCheck()
  }
  
  async  onResizeEnd(pos:{startDate:DateTime,endDate:DateTime}) {
    console.log('upp5555');
    
   await this.eventService.onResizeEnd(pos, this.event )
    this.cdr.detectChanges()
  }
  
}
