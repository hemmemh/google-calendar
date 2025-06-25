import { Directive, ElementRef, EventEmitter, Inject, Input, Output, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { CreateEventComponent } from '../modals/create-event/create-event.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { EventModel } from '../../../models/event.model';
import { DateTime } from 'luxon';
import { ScrollInterval } from './draggable.directive';


export interface ReportChange {
  startDate:DateTime,
  endDate:DateTime,
  all:boolean
  event:EventModel | null,
}


@Directive({
  selector: '[appCreateEvent]'
})
export class CreateEventDirective {

  constructor(
    private elementRef: ElementRef,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private snackBar:MatSnackBar,
    @Inject(DOCUMENT) private document: Document
  ) { }

  readonly DELTA_Y = 15
  startY = 0
  height = 0
  currentMouseYPosition = 0
  eventsContainerClientHeight = 0
  eventsContainer:HTMLElement | null = null
  scrollContainer:HTMLElement | null = null
  startDate = DateTime.now()
  endDate = DateTime.now()
  eventElement:HTMLElement | null = null

  @Input({required:true}) today!:DateTime

  @Output() onCreationEnd: EventEmitter<{ height: number }> = new EventEmitter();

  private cleaner$ = new Subject<void>()
  private destroy$ = new Subject<void>()



  private scrollInterval:ScrollInterval = {
    scrollTopInterval:null,
    scrollBottomInterval:null
  }
  
  private resizeStart$!:Observable<MouseEvent>

  private resizeMove$!:Observable<MouseEvent>

  private resizeEnd$!:Observable<MouseEvent>

  private wheelDrag$!:Observable<WheelEvent>

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

  this.wheelDrag$ = fromEvent<WheelEvent>(this.document,'wheel', {passive:false})
  .pipe(filter(el => el.button === 0))
  .pipe(takeUntil(this.cleaner$))

 

    this.resizeStart$.subscribe((event) => {
      this.resizeEnd$.subscribe(() => this.onMouseUpHandler());
      this.wheelDrag$.subscribe((eventWheel)=>this.onWheelDragHandler(eventWheel))
      this.resizeMove$.subscribe((event) =>this.onMoveHandler(event));
      this.onMouseDownHandler(event)
    });
  }
  


  private onMouseUpHandler(){
    this.openDialog(this.startDate, this.endDate);

    this.onCreationEnd.emit({ height: this.height });
    this.scrollInterval.scrollTopInterval && clearInterval(this.scrollInterval.scrollTopInterval) 
    this.scrollInterval.scrollTopInterval = null
    this.scrollInterval.scrollBottomInterval && clearInterval(this.scrollInterval.scrollBottomInterval) 
    this.scrollInterval.scrollBottomInterval = null
    this.cleaner$.next()
  }

  private openDialog(startDate: DateTime, endDate: DateTime) {

      const dialogRef = this.dialog.open(CreateEventComponent, {
        minWidth: '448px',
        backdropClass: 'cdk-overlay-transparent-backdrop',
        scrollStrategy:new NoopScrollStrategy(),
        data: {
          startDate,
          endDate,
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


 private  onMouseDownHandler(event:MouseEvent){
      this.eventsContainer = this.elementRef.nativeElement
      this.eventsContainerClientHeight = this.document.querySelector('.right')?.clientHeight ?? 0
      this.scrollContainer = this.document.querySelector('.contain')
      this.startY = this.getApproximatePosition(event.offsetY)
      this.height = this.DELTA_Y
      this.currentMouseYPosition = this.startY + this.DELTA_Y
      this.createEvent()
      this.startDate = this.setDate(this.startY)
      this.endDate = this.setDate(this.height)
      this.updateEventTime()
  }

  private onWheelDragHandler(event:WheelEvent){
    event.preventDefault()
    if(!this.scrollContainer) return
    const newPositiion = event.deltaY/100 * this.DELTA_Y
    if(newPositiion > 0 && this.scrollContainer?.getBoundingClientRect().height + this.scrollContainer?.scrollTop === this.scrollContainer?.scrollHeight) return
    if(newPositiion < 0 && this.scrollContainer?.scrollTop === 0  ) return
    this.scrollContainer?.scrollBy(0,newPositiion)
    this.onMoveHandler({offsetY:this.currentMouseYPosition + newPositiion})
    
  }




 private  onMoveHandler(event:{offsetY:number}){
    if(!this.eventsContainer) return
    this.setScrollTopInterval(event)
    this.clearScrollTopInterval(event)
    this.setScrollBottomInterval(event)
    this.clearScrollBottomInterval(event)
    let newPosition = this.getApproximatePosition(event.offsetY)
    this.currentMouseYPosition = newPosition
  
    if(newPosition > this.startY){
      if(event.offsetY > this.eventsContainer?.offsetHeight - (this.DELTA_Y / 2)){
        newPosition = this.eventsContainer?.offsetHeight
      }
      this.updateEventPositions(this.startY, newPosition - this.startY)
    }else{
      if(event.offsetY < this.DELTA_Y){
        newPosition = 0
      }
      this.updateEventPositions(newPosition, this.startY - newPosition)
    }
  
  }











//========================================================================================
 

private updateEventPositions(top:number, height:number){
  if(!this.eventsContainer) return
  if(height === 0 ) return

  this.startDate = this.setDate(top)
  this.endDate = this.setDate(top + height)
  this.height = height
  this.renderer.setStyle(this.eventElement, 'top', top + 'px');
  this.renderer.setStyle(this.eventElement, 'height',  height  + 'px');
}

private setDate(position:number){
  return this.today
   .startOf('day')
   .plus({hours:Math.floor(position / 60), minutes: position % 60})
 }

private  updateEventTime(){
   if(!this.eventElement) return

   this.eventElement.innerText = `${this.startDate.toFormat(
     'HH:mm'
     )} - ${ this.endDate.toFormat("HH:mm") === "00:00" ? "24:00" : this.endDate.toFormat("HH:mm")}`;

 }

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
  background:#529ba5;
   width: 100%;
   box-shadow: 
     0px 6px 10px 0px rgba(0, 0, 0, .14), 
     0px 1px 18px 0px rgba(0, 0, 0, .12), 
     0px 3px 5px -1px rgba(0, 0, 0, .2);
 `;
   event.style.top = this.startY + 'px';
   event.style.height = this.DELTA_Y + 'px'
   this.eventElement = event
   this.eventsContainer?.append(event)
  
 }

 private getApproximatePosition(pos:number){
   return  Math.floor( pos / this.DELTA_Y) * this.DELTA_Y
 }

private setScrollTopInterval(event:{offsetY: number}){
  if(!this.eventsContainer) return
  if(!this.scrollContainer) return

  
  if ( event.offsetY - this.scrollContainer?.scrollTop  < this.DELTA_Y) {

    !this.scrollInterval.scrollTopInterval && (this.scrollInterval.scrollTopInterval = setInterval(()=>this.onscrollInterval(-1), 60))
   return
  }
}

private setScrollBottomInterval(event:{offsetY: number}){
  if(!this.eventsContainer) return
  if(!this.scrollContainer) return

  
  if ( event.offsetY - this.scrollContainer?.scrollTop  > this.eventsContainerClientHeight - this.DELTA_Y) {
    !this.scrollInterval.scrollBottomInterval && (this.scrollInterval.scrollBottomInterval = setInterval(()=>this.onscrollInterval(1), 60))
   return
  }
}

private clearScrollBottomInterval(event:{offsetY: number}){
  if(!this.eventsContainer) return
  if(!this.scrollContainer) return

   
  if  ( event.offsetY   < this.scrollContainer.clientHeight - this.DELTA_Y || this.scrollContainer?.scrollTop + this.scrollContainer.clientHeight  >= this.scrollContainer.scrollHeight ) {
    this.scrollInterval.scrollBottomInterval && clearInterval(this.scrollInterval.scrollBottomInterval) 
    this.scrollInterval.scrollBottomInterval = null
  
  }
} 

private clearScrollTopInterval(event:{offsetY: number}){
  if(!this.eventsContainer) return
  if(!this.scrollContainer) return

  if (event.offsetY - this.scrollContainer?.scrollTop  > this.DELTA_Y || this.scrollContainer?.scrollTop === 0) {
    this.scrollInterval.scrollTopInterval && clearInterval(this.scrollInterval.scrollTopInterval) 
    this.scrollInterval.scrollTopInterval = null
  
  }
}  

private onscrollInterval(type: -1 | 1, ){
 
  
  this.scrollContainer?.scrollBy(0,this.DELTA_Y * type)
  this.onMoveHandler({offsetY:this.currentMouseYPosition + this.DELTA_Y * type})
}

//========================================================================================






}
