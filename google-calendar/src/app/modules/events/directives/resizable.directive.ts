import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Inject, Input, Output, Renderer2 } from '@angular/core';
import { ScrollInterval } from './draggable.directive';
import { filter, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { DateTime } from 'luxon';



export interface CurrentResize {
  top:number,
  height:number
}

export interface Position {
  bottom: number;
  top: number;
  height: number
}

export interface StartPosition {
  startX:number;
  startY:number;
}


export interface InitialScroll {
  scrollInitialTop: number;
  scrollInitialBottom: number;
}

export interface InitialPosition {
  initialBottom: number;
  initialTop: number;
  initialHeight: number
}




@Directive({
  selector: '[appResizable]'
})
export class ResizableDirective {

  constructor(
    private sourceElement: ElementRef,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}


  startY = 0
  eventElement:HTMLElement | null = null
  height = 0
  startDate = DateTime.now()
  endDate = DateTime.now()
  initialLeft = 0
  initialWidth = 0
  eventsContainer:HTMLElement | null = null
  scrollContainer:HTMLElement | null = null
  currentMouseYPosition = 0
  eventsContainerClientHeight = 0
  private scrollInterval:ScrollInterval = {
    scrollTopInterval:null,
    scrollBottomInterval:null
  }
  readonly DELTA_Y = 15
  
  private cleaner$ = new Subject<void>()
  private destroy$ = new Subject<void>()


  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.cleaner$.complete()
  }


 

  @Input() today!:DateTime
  @Output() onResizeMove: EventEmitter<{ height: number, top: number, bottom: number }> = new EventEmitter();
  @Output() onResizeEnd: EventEmitter<{startDate:DateTime,endDate:DateTime}> = new EventEmitter()


  public mousedown = new Subject<{
    top:number,
    height:number
    type:'top' | 'bottom'
  }>()
  
  public mouseMove = new Subject<{ offsetY: number }>()

  public resizeEnd = new Subject()

  private wheelDrag$!: Observable<WheelEvent>



  
  ngAfterViewInit(): void {

    
    this.wheelDrag$ = fromEvent<WheelEvent>(this.document,'wheel', {passive:false})
    .pipe(takeUntil(this.cleaner$))


    this.mousedown
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ top, height, type }) =>{

      this.wheelDrag$
      .subscribe((event:WheelEvent)=>this.onWheelDragHandler(event))
      this.mouseMove
      
      .pipe(takeUntil(this.cleaner$))
      .subscribe((event) =>{
        this.onMoveHandler(event)
      });
  
      this.resizeEnd
      .pipe(takeUntil(this.cleaner$))
      .subscribe((event) => this.mouseUpHandler())

      this.mouseDownHandler(top, height, type)
    });


   

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

  private mouseUpHandler(){
  
    this.onResizeEnd.emit({startDate:this.startDate, endDate:this.endDate})

      this.scrollInterval.scrollTopInterval && clearInterval(this.scrollInterval.scrollTopInterval) 
      this.scrollInterval.scrollTopInterval = null
      this.scrollInterval.scrollBottomInterval && clearInterval(this.scrollInterval.scrollBottomInterval) 
      this.scrollInterval.scrollBottomInterval = null
      this.cleaner$.next()
      
  }


  mouseDownHandler(top:number, height:number,   type:'top' | 'bottom'){
      this.startY = top
      this.height = height
      if(type === 'top'){
        this.currentMouseYPosition = this.startY -  height + this.DELTA_Y
      }else{
        this.currentMouseYPosition = this.startY +  height + this.DELTA_Y
      }
  
      this.eventElement = this.elementRef.nativeElement
      this.eventsContainer = this.document.querySelector('.right')
      this.eventsContainerClientHeight = this.document.querySelector('.right')?.clientHeight ?? 0
      this.scrollContainer = this.document.querySelector('.contain')
  }


  private  onMoveHandler(event:{offsetY:number}){

    
    if(!this.eventsContainer) return
    this.setScrollTopInterval(event)
    this.clearScrollTopInterval(event)
    this.setScrollBottomInterval(event)
    this.clearScrollBottomInterval(event)
    let newPosition = this.getApproximatePosition(event.offsetY)
    
    if(newPosition > this.startY){
   
      if(event.offsetY > this.eventsContainer?.scrollHeight - (this.DELTA_Y / 2)){
        newPosition = this.eventsContainer?.scrollHeight
      }
      this.currentMouseYPosition = newPosition
      this.updateEventPositions(this.startY, newPosition - this.startY)
    }else{
      if(event.offsetY < this.DELTA_Y){
        newPosition = 0
      }
      this.currentMouseYPosition = newPosition
      this.updateEventPositions(newPosition, this.startY - newPosition)
    }
  
  }


  //=========================================================================================

  private  updateEventTime(){
  if(! this.eventElement) return
   const time = this.eventElement.querySelector('.time') as HTMLElement
  if(!time) return
  time.innerText = `${this.startDate.toFormat(
      'HH:mm'
      )} - ${ this.endDate.toFormat("HH:mm") === "00:00" ? "24:00" : this.endDate.toFormat("HH:mm")}`;
 
  }



  private setDate(position:number){
    return this.today
     .startOf('day')
     .plus({hours:Math.floor(position / 60), minutes: position % 60})
   }
   
  private updateEventPositions(top:number, height:number){
    if(!this.eventsContainer) return
    if(height === 0 ) return
  
    
    this.startDate = this.setDate(top)
    this.endDate = this.setDate(top + height)
    this.height = height
    this.renderer.setStyle(this.eventElement, 'top', top + 'px');

    this.renderer.setStyle(this.eventElement, 'height',  height  + 'px');
    this.updateEventTime()
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
  
   
   console.log('event.offsetY ', event.offsetY  - this.scrollContainer.scrollTop, this.scrollContainer.clientHeight - this.DELTA_Y);
   
  
    if  ( event.offsetY  - this.scrollContainer.scrollTop  < this.scrollContainer.clientHeight - this.DELTA_Y || this.scrollContainer?.scrollTop + this.scrollContainer.clientHeight  >= this.scrollContainer.scrollHeight ) {
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
}
