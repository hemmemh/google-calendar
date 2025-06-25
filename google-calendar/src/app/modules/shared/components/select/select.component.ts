import { AfterContentInit, Component, ContentChildren, EventEmitter, forwardRef, HostListener, Input, Output, QueryList } from '@angular/core';
import { MyInputComponent } from '../my-input/my-input.component';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OptionComponent } from '../option/option.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select',
  imports: [MyInputComponent, CommonModule,  FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent implements ControlValueAccessor, AfterContentInit {


   value:any = ''
   inputValue:string = ''
  @Input() placeHolder = ''
   @Output() valueChange = new EventEmitter<any>();
   disable = false
   open = false;

   @ContentChildren(OptionComponent) options!: QueryList<OptionComponent>;


  writeValue(value: any): void {
       if(value){
        this.value = value
        this.inputValue = this.getSelectedLabel()
       }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
  
 
    if(!target.classList.contains('.select-contain') && !target.closest('.select-contain') ){
        this.open = false
    }   
  }

    private onChange: (value: any) => void = () => {};
    private onTouched: () => void = () => {};

   registerOnChange(fn: (value: any) => void): void {
     this.onChange = fn
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }
 
   setDisabledState?(isDisabled: boolean): void {
     this.disable = isDisabled
   }

   ngAfterContentInit(): void {
    this.options.forEach(option => {
      option.select.subscribe(val => {
     
        
        this.value = val;
        this.onChange(this.value)
        this.valueChange.emit(val);
        this.open = false;
        this.inputValue = this.getSelectedLabel()
        console.log('ch', this.open);
      });
    });
  }

  toggleDropdown() {
    this.open = !this.open;
  }

  getSelectedLabel() {
    const selected = this.options.find(o => o.value === this.value);
    return selected?.label ?? 'Выберите...';
  }
 

}
