import { Component, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventsService } from '../../services/events.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventModel } from '../../../../models/event.model';
import { GetEventInfoDatePipe } from '../../pipes/get-event-info-date.pipe';
import { CreateEventComponent } from '../create-event/create-event.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ReportChange } from '../../directives/create-event.directive';
import { DateTime } from 'luxon';
import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-event-info',
  imports: [MatIconModule, MatButtonModule,  GetEventInfoDatePipe, MatMenuModule],
  providers:[EventsService],
  templateUrl: './event-info.component.html',
  styleUrl: './event-info.component.scss'
})
export class EventInfoComponent {

  constructor(
    private eventsService:EventsService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public event:EventModel,
    public dialogRef: MatDialogRef<EventInfoComponent>,
    
  ){}

  
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild('menuTrigger2') menuTrigger2!: MatMenuTrigger;

  delete(all:boolean){
     this.eventsService.delete(this.event.uid, all)
     this.dialogRef.close()
  }

  close(){
    this.dialogRef.close()
  }

  openCreateEvent(all:boolean){
    this.dialog.open(CreateEventComponent, {
      minWidth: '448px',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data: {
        startDate:DateTime.fromMillis( this.event.startDate),
        endDate:DateTime.fromMillis(this.event.endDate),
        event:this.event,
        all
      } as ReportChange,
    });
    this.dialogRef.close()
  }

  onEditClick(){
    console.log('evv', this.event.rrule);
    
    if(this.event.rrule){
      this.menuTrigger.openMenu()
    }else{
      this.openCreateEvent(false)
    }
  }

  onDeleteClick(){
 
    
    if(this.event.rrule){
      this.menuTrigger2.openMenu()
    }else{
      this.delete(false)
    }
  }
}
