import { Component, Input, SimpleChanges } from '@angular/core';
import { DateTime } from 'luxon';
import { CreateFullDayEventDirective } from '../../../events/directives/create-full-day-event.directive';
import { EventModel } from '../../../../models/event.model';
import { FullDayEventComponent } from '../../../events/components/full-day-event/full-day-event.component';
import { EventsStorageService } from '../../../events/services/events-storage.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { GetWeeksCountPipe } from '../../pipes/get-weeks-count.pipe';

@Component({
  selector: 'app-full-day-event-container',
  imports: [CreateFullDayEventDirective, FullDayEventComponent, MatIconModule, CommonModule, GetWeeksCountPipe],
  templateUrl: './full-day-event-container.component.html',
  styleUrl: './full-day-event-container.component.scss'
})
export class FullDayEventContainerComponent {


  
   constructor(private eventsStorageService:EventsStorageService){}


  @Input({required:true}) days!:DateTime[]
  @Input({required:true}) events!:EventModel[]
  @Input({required:true}) today!:DateTime
  groupEvents:EventModel[][] = []
  maxHeight =2
  height = 28
  isEventCrate = false
  isOpen = false
  ngOnInit(): void {

    
    this.groupEvents = this.eventsStorageService.groupEvents(this.events)
    this.getMaxHeight()
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['events']){
   this.groupEvents = this.eventsStorageService.groupEvents(this.events)
   this.getMaxHeight()
    }   
  }


  setOpen(){
    this.isOpen = !this.isOpen
  }
  getMaxHeight(){
    for(const group of this.groupEvents){
         this.maxHeight = Math.max(group.length, this.maxHeight)
    }
   
  }
}
