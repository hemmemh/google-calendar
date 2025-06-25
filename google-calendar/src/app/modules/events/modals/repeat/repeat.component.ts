import { Component, EventEmitter, Inject, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { RepeatType } from '../../../../interfaces/repeat-type';
import { RepeatTypeEnum } from '../../../../enums/repeat-type.enum';
import {MatRadioChange, MatRadioModule} from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { weekDaysEnum, WeekDaysNumber } from '../../../../enums/weekDays.enum';
import { WeekDayType, WeekNumbersType } from '../../../../interfaces/week-days';
import { convertDateToICalFormat } from '../../../../utils/date.util';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateTime, WeekNumbers } from 'luxon';
import { EventModel } from '../../../../models/event.model';
import {RRule} from 'rrule'
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { MyInputComponent } from '../../../shared/components/my-input/my-input.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { OptionComponent } from '../../../shared/components/option/option.component';
@Component({
  selector: 'app-repeat',
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule, MatRadioModule, FormsModule, MatInputModule, MatDatepickerModule,MatCheckboxModule, CommonModule, MatButtonModule, DatePickerComponent, MyInputComponent, SelectComponent, OptionComponent],
  providers:[provideNativeDateAdapter()],
  templateUrl: './repeat.component.html',
  styleUrl: './repeat.component.scss'
})
export class RepeatComponent implements OnInit, OnChanges {


  constructor( 
    public dialogRef: MatDialogRef<RepeatComponent>,
      @Inject(MAT_DIALOG_DATA)
      public event:EventModel,){}
  ngOnChanges(changes: SimpleChanges): void {
     if(changes['event']){
   
     }
  }
  ngOnInit(): void {
    console.log('ev', this.event);
    this.setRrule()
  }

   repeatTypes:RepeatType[] = ['DAILY', 'WEEKLY']
   selectedWeekDays:WeekDayType[] = []
   weekDays:WeekDayType[] = ['MO','TU', 'WE', 'TH', 'FR', 'SA', 'SU']
   repeatTypesEnum = RepeatTypeEnum
   weekDaysEnum = weekDaysEnum
   selectedType:RepeatType = 'DAILY'
   interval = 1
   until =  DateTime.now()
   untilType = 'always'
   everyWorkDay = 'no'

   @Output() onRruleCreate = new EventEmitter<string>()
   updateSelectedWeekDays(day:WeekDayType){
    if(this.selectedWeekDays.includes(day)){
      this.selectedWeekDays = this.selectedWeekDays.filter(el => el !== day)
    }else{
      this.selectedWeekDays.push(day)
    }
   }


   close(){
    this.dialogRef.close()
   }

   onEveryWorkDayChange(event:MatRadioChange<any>){
     if(event.value === 'no'){
      this.selectedWeekDays = []
     }
   }

   createRrule(){
        let rrule = ''
    if(this.everyWorkDay === 'yes' && this.selectedType === 'DAILY') {
      this.interval = 1
      this.selectedWeekDays = ['MO', 'TU', 'WE', 'TH','FR']
    }


    rrule+=`FREQ=${this.selectedType};INTERVAL=${this.interval};`
    if(this.selectedWeekDays.length !== 0  ){
      rrule+=`BYWEEKDAY=${this.selectedWeekDays.join(',')};`
    }

    if(this.untilType === 'until'){
     const date = this.until.plus({'day':1}).toJSDate()
      rrule+=`UNTIL=${convertDateToICalFormat(date)}`
    }
  console.log('rrule', rrule);
  
  this.onRruleCreate.emit(rrule)
  this.dialogRef.close()
   }

   setRrule(){
    if(this.event?.rrule){
       const rrule = RRule.fromString(this.event.rrule)
       console.log('rr', rrule);
       const options = rrule.options
       if(options.until){
       this.until =  DateTime.fromJSDate(options.until).minus({"day":1}) as DateTime
       this.untilType = 'until'
       }

       this.interval = options.interval
       if(options.byweekday){
           this.selectedType = 'WEEKLY'
           if(options.byweekday.join(',') === '0,1,2,3,4'){
            this.everyWorkDay = 'yes'
           }
           for(const day of options.byweekday as WeekNumbersType){
             this.selectedWeekDays.push( WeekDaysNumber[day])
           }
       }
    }

   }
}
