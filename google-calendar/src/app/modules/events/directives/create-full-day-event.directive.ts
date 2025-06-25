import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Inject, OnInit, Output, Renderer2 } from '@angular/core';
import { DateTime } from 'luxon';
import { filter, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { CreateEventComponent } from '../modals/create-event/create-event.component';
import { MatDialog } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ReportChange } from './create-event.directive';

@Directive({
  selector: '[appCreateFullDayEvent]'
})
export class CreateFullDayEventDirective implements OnInit {

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document
  ) { }

  @Output() onCreationEnd: EventEmitter<{ startDate: DateTime, endDate:DateTime }> = new EventEmitter();


  eventsContainer:HTMLElement | null = null
  eventElement:HTMLElement | null = null
  startX = 0
  startWidth = 0
  elementX = 0
  elementWidth = 0
  startDate:DateTime = DateTime.now()
  endDate:DateTime = DateTime.now()
  private cleaner$ = new Subject<void>()
  private destroy$ = new Subject<void>()


  private resizeStart$!:Observable<MouseEvent>
  private resizeMove$!:Observable<MouseEvent>
  private resizeEnd$!:Observable<MouseEvent>

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.cleaner$.complete()
  }


  ngOnInit(): void {
  this.resizeStart$ = fromEvent<MouseEvent>(this.elementRef.nativeElement,'mousedown')
  .pipe(filter(el => el.button === 0))
  .pipe(takeUntil(this.destroy$));

  this.resizeMove$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mousemove' )
  .pipe(filter(el => el.button === 0))
  .pipe(takeUntil(this.cleaner$));

  this.resizeEnd$ = fromEvent<MouseEvent>(this.document, 'mouseup')
  .pipe(filter(el => el.button === 0))
  .pipe(takeUntil(this.cleaner$));


  this.resizeStart$.subscribe((event) => {
    this.resizeEnd$.subscribe(() => this.onMouseUpHandler());
    this.resizeMove$.subscribe((event) =>this.onMoveHandler(event));
    this.onMouseDownHandler(event)
  });
  }

  private  onMouseDownHandler(event:MouseEvent){
      this.eventsContainer = this.elementRef.nativeElement
      if(!this.eventsContainer) return
        const elements =  this.document.elementsFromPoint(event.clientX, event.clientY)
        this.eventElement = elements.find(el => el.classList.contains('day-container')) as HTMLElement
       
        const dateISO =  this.eventElement.getAttribute('data-today')
        if(dateISO){
          this.startDate = DateTime.fromISO(dateISO)
          this.endDate = DateTime.fromISO(dateISO).plus({day:1})
        }
       

        
       this.startX = this.eventElement.offsetLeft / this.eventsContainer.offsetWidth * 100
       this.startWidth =  this.eventElement.offsetWidth / this.eventsContainer.offsetWidth * 100
       this.elementX = this.startX
       this.elementWidth =this.startWidth
       this.createEvent()
    }

    private  onMoveHandler(event:{offsetX:number}){
      if(!this.eventsContainer) return
      const newPosition = event.offsetX  / this.eventsContainer.offsetWidth * 100

      if(newPosition < this.elementX){
        this.elementX-=this.startWidth
        this.elementWidth+=this.startWidth
        this.startDate = this.startDate.minus({day:1})
      }
      if(newPosition > this.elementX + this.startWidth && newPosition < this.startX + this.startWidth && this.elementWidth !== this.startWidth){
        this.elementX+=this.startWidth
        this.elementWidth-=this.startWidth
        this.startDate = this.startDate.plus({day:1})
      }
   
      if(newPosition > this.elementX + this.elementWidth){
        this.elementWidth+=this.startWidth
        this.endDate = this.endDate.plus({day:1})
      }

        if(newPosition <  this.elementX + this.elementWidth - this.startWidth && newPosition >  this.startX   && this.elementWidth !== this.startWidth){
          this.elementWidth-=this.startWidth
          this.endDate = this.endDate.minus({day:1})
        }

      this.updateEventPositions(this.elementX, this.elementWidth)

    }
  

    private openDialog(startDate: DateTime, endDate: DateTime) {

      const dialogRef = this.dialog.open(CreateEventComponent, {
        minWidth: '448px',
        backdropClass: 'cdk-overlay-transparent-backdrop',
        scrollStrategy:new NoopScrollStrategy(),
        data: {
          startDate,
          endDate
        } as ReportChange,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.deleteEventElement()
      });
  }

  private deleteEventElement(){
    if(!this.eventElement) return
    this.elementRef.nativeElement.removeChild(this.eventElement);
  }

    private onMouseUpHandler(){
      this.openDialog(this.startDate, this.endDate);
      this.onCreationEnd.emit({ startDate:this.startDate, endDate:this.endDate });
      this.cleaner$.next()
    }
  

    //===========================================================================================================================


   


    private  createEvent(){
      const event = document.createElement('div');
      event.style.cssText = `
      user-select: none;
      z-index: 1000;
      pointer-events: none;
      position: absolute;
      border-radius: 4px;
      padding: 4px;
      color: #fff;
      font-weight: 500;
      font-size: 12px;
      letter-spacing: .1px;
      line-height: 15px;
      height:13px;
     background:#529ba5;
      box-shadow: 
        0px 6px 10px 0px rgba(0, 0, 0, .14), 
        0px 1px 18px 0px rgba(0, 0, 0, .12), 
        0px 3px 5px -1px rgba(0, 0, 0, .2);
    `;
      event.style.left = this.startX + '%';
      event.style.width = this.startWidth + '%'
      this.eventElement = event
      this.eventsContainer?.append(event)
     
    }

    private updateEventPositions(left:number, width:number){
      if(!this.eventsContainer) return

      this.renderer.setStyle(this.eventElement, 'left', left + '%');
      this.renderer.setStyle(this.eventElement, 'width',  width  + '%');
    }
    
}
