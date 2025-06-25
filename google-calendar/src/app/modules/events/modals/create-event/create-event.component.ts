import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { ReportChange } from '../../directives/create-event.directive';
import { DateTime } from 'luxon';
import { CreateEventDTO } from '../../../../dtos/create-event.dto';
import { LoginService } from '../../../login/services/login.service';
import { EventsService } from '../../services/events.service';
import {MatMenuModule} from '@angular/material/menu';
import { RepeatComponent } from '../repeat/repeat.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { User } from '../../../../models/user.model';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MyInputComponent } from '../../../shared/components/my-input/my-input.component';
import { MyTextAreaComponent } from '../../../shared/components/my-text-area/my-text-area.component';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { TimePickerComponent } from '../../../shared/components/time-picker/time-picker.component';

@Component({
  selector: 'app-create-event',
  imports: [
    MatButtonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatDatepickerModule, 
    MatInputModule, 
    CommonModule, 
    MatTimepickerModule, 
    FormsModule, 
    MatMenuModule,
    RepeatComponent,
    MyInputComponent,
    MyTextAreaComponent,
    DatePickerComponent,
    TimePickerComponent,
    MatCheckboxModule
  ],
  providers:[provideNativeDateAdapter(), EventsService],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss'
})
export class CreateEventComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CreateEventComponent>,
    public dialog: MatDialog,
    private loginService:LoginService,
    @Inject(MAT_DIALOG_DATA)
    public data:ReportChange,
    private eventsService:EventsService

  ) {}

  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);

  ngOnInit(): void {
    this._adapter.setLocale('ru-RU');
    if(this.data.event){
      this.title = this.data.event.title
      this.description = this.data.event.description
      this.rrule = this.data.event.rrule
      this.rruleUid = this.data.event.rruleUid
      this.isRepeat = this.rrule !== null
    }
    console.log('NN', this.data.startDate);
    
    this.startDate = this.data.startDate
    this.startTime = this.data.startDate
    this.endDate = this.data.endDate
    this.endTime = this.data.endDate
    this.loginService.user$.subscribe(user => {
      this.user = user
    })
  }


  title:string = ''
  description:string = ''
  startDate:DateTime = DateTime.now()
  startTime:DateTime  =DateTime.now()
  endDate:DateTime = DateTime.now()
  testDate = ''
  endTime:DateTime = DateTime.now()
  rrule:string | null = null
  rruleUid:string | null = null
  user:User | null = null
  isRepeat = false


  async saveEvent() {
  
    if(!this.user) return
    
    let newStartDate = this.startDate
    const newStartTime = this.startTime
    newStartDate = newStartDate.set({
      hour:newStartTime.hour,
      minute:newStartTime.minute
    })

    let newEndDate = this.endDate
    const newEndTime = this.endTime
    newEndDate = newEndDate.set({
      hour:newEndTime.hour,
      minute:newEndTime.minute
    })


    const newEvent:CreateEventDTO = {
     title: this.title,
     description: this.description,
     startDate:newStartDate.toMillis(),
     endDate:newEndDate.toMillis(),
     rrule: this.isRepeat ? this.rrule : null,
     rruleUid:this.rruleUid,
     user:this.user

 
     
    
    }



    if (this.data.event) {
      await this.eventsService.update({...this.data.event, ...newEvent, all:this.data.all} )
    }

    if (!this.data.event) {
     await this.eventsService.create( newEvent)
     }

    this.dialogRef.close('saved');
    this.dialog.closeAll()
  }

  openRepeatModal(event:MouseEvent) {
     const target = event.target as HTMLElement
  
    const rect = target.getBoundingClientRect();
    console.log('target', rect.top);
     
    const leftPosition = rect.left + target.offsetWidth
     
    const repeat = this.dialog.open(RepeatComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data:  this.data.event,
      width: '448px',
      position: {
        left: `${leftPosition}px`,
        top: `${rect.top - 200}px`,
      },
    });

    repeat.componentInstance.onRruleCreate.subscribe(rrule =>{
      this.rrule = rrule
      this.isRepeat = true
    })
  }

  changeIsReapeat(){
     this.isRepeat = !this.isRepeat
  }
  close(){
    this.dialogRef.close()
  }

  
}
