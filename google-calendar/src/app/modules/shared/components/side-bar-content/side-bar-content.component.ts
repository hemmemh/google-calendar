import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-side-bar-content',
  imports: [CommonModule],
  templateUrl: './side-bar-content.component.html',
  styleUrl: './side-bar-content.component.scss'
})
export class SideBarContentComponent implements OnChanges {

  @HostBinding('class.openedContent')  @Input() opened = true

 @Output() onChangeOpened = new EventEmitter<boolean>()

 ngOnChanges(changes: SimpleChanges): void {
   if(changes['opened']){
    this.onChangeOpened.emit(this.opened)
   }
}

}
