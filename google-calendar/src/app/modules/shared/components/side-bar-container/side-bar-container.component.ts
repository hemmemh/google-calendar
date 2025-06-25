import { AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, HostBinding, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SideBarContentComponent } from '../side-bar-content/side-bar-content.component';
import { SideBarComponent } from '../side-bar/side-bar.component';

@Component({
  selector: 'app-side-bar-container',
  imports: [],
  templateUrl: './side-bar-container.component.html',
  styleUrl: './side-bar-container.component.scss'
})
export class SideBarContainerComponent implements AfterContentInit, OnChanges {

  @ContentChild(SideBarComponent) sidebar!: SideBarComponent;
  @ViewChild('sidebarElement', { static: true }) sidebarElement!: ElementRef;
  @ViewChild('sidebarContentElement', { static: true }) sidebarContentElement!: ElementRef;
  @ContentChild(SideBarContentComponent) sidebarContent!: SideBarContentComponent;
  @HostBinding('class.openedContent')   opened = true

  ngAfterContentInit(): void {
 
    this.sidebar.onChangeOpened.subscribe(opened => {
      this.opened = opened
    })
  
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['opened']){
       if(this.opened){
        const sidebarContentElement = this.sidebarContentElement.nativeElement as HTMLElement
        sidebarContentElement.classList.add('opened')
       }else{
        
       }
    }
  }


}
