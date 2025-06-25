import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-my-text-area',
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MyTextAreaComponent),
      multi: true
    }
  ],
  templateUrl: './my-text-area.component.html',
  styleUrl: './my-text-area.component.scss'
})
export class MyTextAreaComponent  implements ControlValueAccessor, AfterViewInit{
  ngAfterViewInit(): void {
    
    if(this.autoResize){
      this.setAutoResize()
    }

    if(this.minHeight){
      this.textarea.nativeElement.style.minHeight =  this.minHeight + 'px'
    }

    if(this.maxHeight){
      this.textarea.nativeElement.style.maxHeight =  this.maxHeight + 'px'
    }
  }


  @ViewChild('textarea', { static: false }) textarea!: ElementRef;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
 
  value = ''
  focused = false
  @Input() placeHolder = ''
  @Input() minHeight:number | null = null
  @Input() maxHeight:number | null = null
  @Input() autoResize:boolean = false
  @Input() disabled = false
  @Output() input = new EventEmitter<string>()

  writeValue(value:string): void {
    if (value !== undefined) {
      this.value = value;
    }
  }
  registerOnChange(fn: (value: string) => void): void {
     this.onChange = fn
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
     this.disabled = isDisabled
  }

  setAutoResize() {
    const textarea = this.textarea.nativeElement;
    textarea.style.height = 'auto'; // Сброс высоты
    textarea.style.height = `${textarea.scrollHeight + 1}px`; // Устанавливаем высоту на основе контента
  }

    
  onInputChange(event:Event): void {
    this.autoResize && this.setAutoResize()
    const target = event.target as HTMLInputElement
    const value = target.value
    this.value = value;
    this.input.emit(value)
    this.onChange(value);
  }

  onBlur(): void {
    this.setFocused(false)
    this.onTouched();
  }




  setFocused(bool:boolean){
    this.focused = bool
  }



}
