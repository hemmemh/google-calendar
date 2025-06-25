import { ChangeDetectorRef, Component, ElementRef, SimpleChanges, ViewChild } from '@angular/core';
import { EventContainerComponent } from '../event-container/event-container.component';
import { EventContainerHeaderComponent } from '../event-container-header/event-container-header.component';
import { TimelineComponent } from '../timeline/timeline.component';
import { DateTime } from 'luxon';
import { EventModel } from '../../../../models/event.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { EventsStorageService } from '../../../events/services/events-storage.service';
import { EventsService } from '../../../events/services/events.service';
import { CalendarService } from '../../services/calendar.service';
import { IsEventInCuurentDatePipe } from '../../pipes/is-event-in-cuurent-date.pipe';
import { FullDayEventContainerComponent } from '../full-day-event-container/full-day-event-container.component';
import { GetFullDayEventsPipe } from '../../pipes/get-full-day-events.pipe';

@Component({
  selector: 'app-day-calendar',
  imports: [EventContainerComponent, EventContainerHeaderComponent, TimelineComponent, IsEventInCuurentDatePipe, FullDayEventContainerComponent, GetFullDayEventsPipe],
  providers:[EventsService],
  templateUrl: './day-calendar.component.html',
  styleUrl: './day-calendar.component.scss'
})
export class DayCalendarComponent {


  
  timeRange: string[] = [];
  today:DateTime =DateTime.now();
  prevDate:DateTime =DateTime.now()
  isFirstInit = true
  events: EventModel[] = [];
  undoActive:boolean = false
  redoActive:boolean = false
  visible = false
  
  private destroy$ = new Subject<void>();

  @ViewChild('container') container!: ElementRef;
  @ViewChild('content') content!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private eventStorage: EventsStorageService,
    private eventsService: EventsService,
    private calendarService: CalendarService,
    private elRef:ElementRef,
    private cdr:ChangeDetectorRef,
  ) {
    
  }



  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

 

 async  ngOnInit() {

    this.eventStorage.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe((events) => {
        if (!events) return
        this.events = [...events]
        this.cdr.markForCheck()
      });



    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(async(data) => {

      this.today = DateTime.fromObject({year:data['year'], month: data['month'], day:data['date']})
      this.cloneContentActions()
      const startDate =this.today.startOf('day').minus({day:1}).toMillis()
      const endDate = this.today.endOf('day').plus({day:1}).toMillis()
      await this.eventsService.getByParams(startDate,endDate)
      this.visible = true
      this.cdr.markForCheck()
    });

  }



  cloneContentActions(){
    if(this.isFirstInit){
      this.prevDate = this.today
      this.isFirstInit = false
    }

    if(this.visible){
      this.calendarService.cloneContent(this.elRef.nativeElement,'.contain', this.prevDate.toMillis() < this.today.toMillis())
    }
    this.visible = false

    this.prevDate = this.today
  }

}
