import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MyInputComponent } from '../my-input/my-input.component';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-time-picker',
  imports: [MyInputComponent, MatButtonModule, MatIconModule, FormsModule, CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss'
})
export class TimePickerComponent implements OnChanges, OnInit,  ControlValueAccessor{


  constructor(private elementRef:ElementRef){

  }
  @ViewChild('icon', { static: false }) icon!: ElementRef;

  writeValue(date:DateTime): void {
   if(date){
    this.value = date
    this.setTimes()
    this.onChange(this.value);
    this.inputValue = this.value.toFormat('HH:mm')
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

  ngOnInit(): void {
    this.setTimes()
 
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['interval']){
      this.setTimes()
      
    }
  }

  private onChange: (date: DateTime) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const icon = this.elementRef.nativeElement.querySelector('.icon') as HTMLElement
    if(!target.classList.contains('times') && !target.closest('.times')  &&  !icon.contains(target)){
        this.timesVisible = false
    }
  }

  disable = false
  value:DateTime = DateTime.now()
  times:DateTime[] = []
  timesVisible = false
  inputValue = this.value.toFormat('HH:mm')
  @Input() interval=  30
   @Input() placeHolder = ''
  @Output() onChangeDate = new EventEmitter<DateTime>()

  onTimeClick(time:DateTime){
    console.log('time', time);
    
       this.onChangeDate.emit(time)
       this.value = time
       this.inputValue = this.value.toFormat('HH:mm')
       this.timesVisible = false
       this.onChange(time);
  }
  setTimesVisible(bool:boolean){

    this.timesVisible = !this.timesVisible
  }
  

  setTimes(){

    let start = this.value.startOf('day')
    this.times = [start]
    const end = start.plus({day:1})
  while (start.toMillis() < end.toMillis()) {
       start = start.plus({'minutes': this.interval})
       this.times.push(start)
  }
 
  return this.times
 
  
  }
}
