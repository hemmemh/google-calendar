import { AfterContentInit, AfterViewInit, Component, ContentChild, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { OptionComponent } from '../option/option.component';
import { SideBarContentComponent } from '../side-bar-content/side-bar-content.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent implements OnChanges {

  @HostBinding('class.openedContent')  @Input() opened = true

 @Output() onChangeOpened = new EventEmitter<boolean>()

 ngOnChanges(changes: SimpleChanges): void {
   if(changes['opened']){
    this.onChangeOpened.emit(this.opened)
   }
}

}



