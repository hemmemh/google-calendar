import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Inject, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { DateTime } from 'luxon';
import { filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { EventModel } from '../../../models/event.model';
import { MatDialog } from '@angular/material/dialog';
import { EventInfoComponent } from '../modals/event-info/event-info.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Directive({
  selector: '[appDraggableFullDay]'
})
export class DraggableFullDayDirective implements OnInit{

  constructor( 
    private elementRef: ElementRef,
    private renderer: Renderer2,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document
  ) { }



    private cleaner$ = new Subject<void>()
    private destroy$ = new Subject<void>()

   currentLeft = 0
   startLeft = 0
   clientLeft = 0
   currentWidth = 0
   deltaX = 0
   startX = 0


   @Input({required:true}) startDate!:DateTime
   @Input({required:true}) endDate!:DateTime
   @Input({required:true}) event!:EventModel
   @Input({required:true}) days!:number

   @Output() onDragEnd: EventEmitter<{
    startDate:DateTime,
    endDate:DateTime
    }> = new EventEmitter();
  
  
   eventsContainer:HTMLElement | null = null
   eventElement:HTMLElement | null = null
   clone:HTMLElement | null = null

    ngOnDestroy(): void {
      this.destroy$.next()
      this.destroy$.complete()
      this.cleaner$.complete()
    }
  

    ngOnInit(): void {
      const dragStart$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mousedown')
       .pipe(filter(el => el.button === 0))
         .pipe(takeUntil(this.destroy$));

      const drag$ = fromEvent<MouseEvent>(this.document, 'mousemove')
      .pipe(filter(el => el.button === 0))
         .pipe(takeUntil(this.cleaner$));

         const dragEnd$ = fromEvent<MouseEvent>(this.document, 'mouseup')
         .pipe(filter(el => el.button === 0))
         .pipe(takeUntil(this.cleaner$));

         dragStart$.subscribe((event: MouseEvent) => {
          this.onMouseDownHandler(event)
          drag$.subscribe((event: MouseEvent) => this.onMouseMoveHandler(event));
          dragEnd$.subscribe(() =>this.onMouseUpHandler());
        });
       }
      

       private onMouseDownHandler(event:MouseEvent){
        event.stopPropagation();
        this.eventElement = this.elementRef.nativeElement as HTMLElement
        const target = event.target as HTMLElement
        this.eventsContainer = target.closest('.full-day-events-container')
        if(!this.eventElement || !this.eventsContainer) return
        this.currentLeft = this.eventElement.offsetLeft
        this.startLeft = this.eventElement.offsetLeft
        this.startX = event.clientX
        this.clientLeft = this.eventElement.getBoundingClientRect().left
        this.currentWidth = this.eventElement.offsetWidth

        const containerWidth =  this.eventsContainer.offsetWidth
        this.deltaX = Math.round( containerWidth / this.days) 
 
        

        this.clone = this.cloneElement()
        this.eventElement.classList.add('active')
        this.eventsContainer?.append(this.clone)
      }


      private onMouseMoveHandler(event:{clientY:number, clientX:number}){
        if(!this.eventsContainer || !this.eventElement) return
        const delta = event.clientX -this.startX
        if(event.clientX < this.clientLeft){
          this.currentLeft-= this.deltaX
          this.startDate = this.startDate.minus({day:1})
          this.endDate = this.endDate.minus({day:1})
          console.log('NNNN', this.startDate, this.endDate);
        }
        if(event.clientX > this.clientLeft + this.currentWidth){
          this.currentLeft+=this.deltaX
          this.startDate = this.startDate.plus({day:1})
          this.endDate = this.endDate.plus({day:1})
        }
      
        this.updateClonePosition(this.currentLeft, this.currentWidth)
      }

      
  private onMouseUpHandler(){
    if(!this.clone) return

    this.clone.remove();
  
    const eventelement =  this.elementRef.nativeElement as HTMLElement
    eventelement.classList.remove('active')

    console.log('&&', this.startDate, this.endDate);
    
    this.onDragEnd.emit({ startDate:this.startDate, endDate:this.endDate});

  
    this.cleaner$.next()

      if(this.currentLeft === this.startLeft){
        this.openEventInfo(this.elementRef, this.event)
      }
  }


      private updateClonePosition(left:number, width:number){
        if(!this.eventsContainer || !this.clone) return
    
        const leftPercent = (left / this.eventsContainer.offsetWidth) * 100
        const widthPercent = (width / this.eventsContainer.offsetWidth) * 100
   
        this.renderer.setStyle(this.clone, 'left',leftPercent + '%');
        this.renderer.setStyle(this.clone, 'width',  widthPercent  + '%');
        this.clientLeft = this.clone.getBoundingClientRect().left
      }


     //========================================================================================================



     openEventInfo(elementRef:ElementRef<any>, event:EventModel) {
     
      const rect =
      elementRef.nativeElement.children[0].getBoundingClientRect();
  
    const rightOffset = window.innerWidth - rect.right;
    let leftPosition = (window.innerWidth - 448) / 2;
    if (rect.left < 448 && rightOffset > 448) {
      leftPosition = rect.right + 5;
    }
    if (rect.left > 448) {
      leftPosition = rect.left - 448 - 5;
    }
       
      this.dialog.open(EventInfoComponent, {
        backdropClass: 'cdk-overlay-transparent-backdrop',
        scrollStrategy:new NoopScrollStrategy(),
        data: event,
        width: '448px',
        position: {
          left: `${leftPosition}px`,
          top: `${rect.top}px`,
        },
      });
    }

    
     private cloneElement(): HTMLElement {
      const clonedElement = this.elementRef.nativeElement.cloneNode(true) as HTMLElement;
      clonedElement.setAttribute('data-uid', 'null')
      return clonedElement;
    }
}
