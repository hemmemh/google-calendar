import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { EventModel } from '../../../../models/event.model';
import { EventsService } from '../../services/events.service';
import { MatDialog } from '@angular/material/dialog';
import { changeEventDate, hoursAndMinutesByReportDate } from '../../helpers/time.helpers';
import { DraggableDirective } from '../../directives/draggable.directive';
import { ResizableDirective } from '../../directives/resizable.directive';
import { ResizeHandlerDirective } from '../../directives/resize-handler.directive';
import { CalculateEventHeightPipe } from '../../pipes/calculate-event-height.pipe';
import { CalculateEventTopPipe } from '../../pipes/calculate-event-top.pipe';
import { DateTime } from 'luxon';
import { InitSecondPartHeightPipe } from '../../pipes/init-second-part-height.pipe';

@Component({
  selector: 'app-event',
  imports: [DraggableDirective, ResizableDirective,ResizeHandlerDirective, CalculateEventHeightPipe, CalculateEventTopPipe, InitSecondPartHeightPipe],
  templateUrl: './event.component.html',
  
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit, OnChanges{
  @HostBinding('class.event-host') isActive = true;

  @Input() event!: EventModel ;
  @Input() index!: number;
  @Input() width!: number;
  @Input() left!: number;
  @Input() day!:DateTime
  @Output() onUpdate = new EventEmitter()

  @ViewChild('eventComponent') eventComponent!: ElementRef;

  isDragging: boolean = false;
  loader:boolean = false
  reportTimes = ``

  constructor(
    private eventService: EventsService,
    private cdr:ChangeDetectorRef,
    public dialog: MatDialog,
    public elementRef: ElementRef,

  ) {}


  ngOnChanges(changes: SimpleChanges): void {
    if(changes['event']){
      this.reportTimes = hoursAndMinutesByReportDate(this.event)
    }
  }


  async ngOnInit() {
    this.reportTimes = hoursAndMinutesByReportDate(this.event)
  }

 async onEventDrop({startDate, endDate}:{startDate:DateTime, endDate:DateTime}) {


  this.reportTimes = await this.eventService.onEventDrop(startDate, endDate, this.event)
  //this.loader = false
  this.cdr.markForCheck()
}

  onResizeMove(event: { height: number; top: number; bottom: number }) {
    this.event.startDate = changeEventDate(this.event.startDate ,event.top,this.day) 
    this.event.endDate = changeEventDate(this.event.endDate ,event.bottom, this.day)  
    this.reportTimes = hoursAndMinutesByReportDate(this.event)
  }

async  onResizeEnd(pos:{startDate:DateTime,endDate:DateTime}) {
  
  
    this.reportTimes = await this.eventService.onResizeEnd(pos, this.event )
    this.cdr.detectChanges()
  }

  
}
