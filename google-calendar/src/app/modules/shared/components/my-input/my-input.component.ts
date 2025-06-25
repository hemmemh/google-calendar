import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-my-input',
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MyInputComponent),
      multi: true
    }
  ],
  templateUrl: './my-input.component.html',
  styleUrl: './my-input.component.scss'
})
export class MyInputComponent implements ControlValueAccessor {

 

 private  changeByMinMax(){
    if(this.type === 'number'){
      console.log('val', this.value);
      
      if(+this.value < this.min){
           this.value =this.min
           this.input.emit(this.value)
           this.onChange(this.value);
      }

      if(+this.value  > this.max){
        this.value = this.max
        this.input.emit(this.value)
        this.onChange(this.value);
      }
    }
  }

 



  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};
 
  value:number | string = ''
  @Input() placeHolder = ''
  @Input() min = 0
  @Input() max = 100
  @Input() type:'text' | 'number' = 'text'
  @Input() disabled = false
  @Output() input = new EventEmitter<string | number>()

  writeValue(value:string): void {
    if (value !== undefined) {
      this.value = value;
    }
  }
  registerOnChange(fn: (value: string | number) => void): void {
     this.onChange = fn
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
     this.disabled = isDisabled
  }
  
  onInputChange(event:Event): void {
    const target = event.target as HTMLInputElement
    const value = target.value
    this.value = value;
    this.input.emit(value)
    this.onChange(value);
    this.changeByMinMax()
  }

  onBlur(): void {
    this.setFocused(false)
    this.onTouched();
  }

  focused = false


  setFocused(bool:boolean){
    this.focused = bool
  }
}
