import { ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { MyInputComponent } from '../my-input/my-input.component';
import { MonthPickerComponent } from '../month-picker/month-picker.component';
import { DateTime } from 'luxon';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  imports: [MyInputComponent, MonthPickerComponent, FormsModule, MatButtonModule, MatIconModule, CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent implements ControlValueAccessor {

  constructor(
    private elementRef:ElementRef,
    private cdr:ChangeDetectorRef,
  ){

  }

  writeValue(date:DateTime): void {
    if(date){
      console.log('MM', date);
      
      this.today = date
      this.value = this.today.toFormat('dd.MM.yyyy')
    }
    
   
  }



  registerOnChange(fn: (date: DateTime) => void): void {
    this.onChange = fn
 }
 registerOnTouched(fn: () => void): void {
   this.onTouched = fn
 }

  setDisabledState?(isDisabled: boolean): void {
    this.disable = isDisabled
  }


  private onChange: (date: DateTime) => void = () => {};
  private onTouched: () => void = () => {};
  @Input() placeHolder = ''
  @Output() onChangeDate = new EventEmitter<DateTime>()
  today = DateTime.now()
  value = this.today.toFormat('dd.MM.yyyy')
  disable = false
  calendarVisible = false
  onDateClick( date: DateTime){
    this.today = date
    this.value = date.toFormat('dd.MM.yyyy')
    this.onChangeDate.emit(date)
    this.onChange(date);
    this.calendarVisible = false
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const icon = this.elementRef.nativeElement.querySelector('.icon') as HTMLElement
 
    if(!target.classList.contains('month-picker') && !target.closest('.month-picker')    &&  !icon.contains(target)){
        this.calendarVisible = false
        // this.today = DateTime.now()
        // this.onChange( this.today);
    }   
  }

  setCalendar(bool:boolean){

    this.calendarVisible = !this.calendarVisible
  }
}
