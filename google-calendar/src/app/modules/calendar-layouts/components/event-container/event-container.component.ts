import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CreateEventDirective } from '../../../events/directives/create-event.directive';
import { EventModel } from '../../../../models/event.model';
import { EventComponent } from '../../../events/components/event/event.component';
import { DateTime } from 'luxon';
import { EventsStorageService } from '../../../events/services/events-storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-container',
  imports: [CreateEventDirective, EventComponent, CommonModule],
  templateUrl: './event-container.component.html',
  styleUrl: './event-container.component.scss'
})
export class EventContainerComponent implements OnInit, OnChanges {

 constructor(private eventsStorageService:EventsStorageService){}
  @Input() events!:EventModel[]
  @Input() day!:DateTime
  groupEvents:EventModel[][] = []
  isEventCrate = false
  hours = Array.from({length:24}, (_,i) => i + 1)
  ngOnInit(): void {

    this.groupEvents = this.eventsStorageService.groupEvents(this.events)
 
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['events']){
   this.groupEvents = this.eventsStorageService.groupEvents(this.events)
  
    }   
  }
}
