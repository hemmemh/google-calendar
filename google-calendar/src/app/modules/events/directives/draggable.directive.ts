import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Inject, Input, Output, Renderer2 } from '@angular/core';
import { DateTime } from 'luxon';
import { filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { EventModel } from '../../../models/event.model';
import { MatDialog } from '@angular/material/dialog';
import { EventInfoComponent } from '../modals/event-info/event-info.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';



export interface StartPosition {
  startX:number
  startY:number
}

export interface ScrollInterval {
  scrollTopInterval:ReturnType<typeof setInterval> | null 
  scrollBottomInterval:ReturnType<typeof setInterval> | null
}

@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective {

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document
  ) {}

  readonly DELTA_Y = 15
  clone:HTMLElement | null = null
  eventsContainer:HTMLElement | null = null
 
  currentMouseYPosition = 0
  currentMouseXPosition = 0
  currentScrollPostition = 0
  startPosition = 0
  eventsContainerClientHeight = 0
  startTop = 0
  scrollContainer:HTMLElement | null = null

  startY = 0
  height = 0
  secondContainer:HTMLElement | undefined = undefined
  startHeight = 0
  isDragging = false
  @Input({required:true}) secondPartHeight = 0
  @Input({required:true}) event!:EventModel
  startDate = DateTime.now()
  endDate = DateTime.now()

  secondPartElement:HTMLElement | null = null
  private scrollInterval:ScrollInterval = {
    scrollTopInterval:null,
    scrollBottomInterval:null
  }

  @Output() onDragEnd: EventEmitter<{
  startDate:DateTime,
  endDate:DateTime
  }> = new EventEmitter();



 
  @Input({required:true}) today!:DateTime
  private cleaner$ = new Subject<void>()
  private destroy$ = new Subject<void>()


  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.cleaner$.complete()
  }




  ngAfterViewInit(): void {
 
    const dragStart$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mousedown')
    .pipe(filter(el => el.button === 0))
    .pipe(takeUntil(this.destroy$));

    const dragEnd$ = fromEvent<MouseEvent>(this.document, 'mouseup')
    .pipe(filter(el => el.button === 0))
    .pipe(takeUntil(this.cleaner$));
    
    const wheelDrag$ = fromEvent<WheelEvent>(this.document,'wheel',  {passive:false})
    .pipe(filter(el => el.button === 0))
    .pipe(takeUntil(this.cleaner$));


    const drag$ = fromEvent<MouseEvent>(this.document, 'mousemove')
    .pipe(filter(el => el.button === 0))
    .pipe(takeUntil(this.cleaner$));
   

    dragStart$.subscribe((event: MouseEvent) => {

      wheelDrag$.subscribe((event:WheelEvent)=>this.onWheelHandler(event))

     drag$.subscribe((event: MouseEvent) => this.onMouseMoveHandler(event));
      
      dragEnd$.subscribe(() =>this.onMouseUpHandler());

      this.onMouseDownHandler(event)
    });

  }

  private onMouseDownHandler(event:MouseEvent){

    event.stopPropagation();
    this.startDate = DateTime.fromMillis(this.event.startDate) as DateTime
    this.endDate = DateTime.fromMillis(this.event.endDate) as DateTime
    this.currentMouseYPosition = event.clientY
    this.currentMouseXPosition =  event.clientX
    this.currentScrollPostition = 0
    const target = event.target as HTMLElement
    this.eventsContainer = target.closest('.events-container')
    this.scrollContainer = target.closest('.contain')
  
    this.eventsContainerClientHeight = this.document.querySelector('.right')?.clientHeight ?? 0
    this.clone = this.cloneElement()
    this.eventsContainer?.append(this.clone)
    const safeUid = CSS.escape(this.event.uid);
    const elements = document.querySelectorAll(`[data-uid=${safeUid}]`);
    for(const element of elements){
      element.classList.add('active')
    }
  
    this.startY = this.clone.offsetTop
    this.startPosition = event.clientY
    this.startTop = this.clone.offsetTop
    this.height = this.clone.offsetHeight
    this.startHeight = this.clone.offsetHeight

  }

  private onWheelHandler(event:WheelEvent){
   event.preventDefault()
   if(!this.scrollContainer) return
   const newPositiion = event.deltaY/100 * this.DELTA_Y
   if(newPositiion > 0 && this.scrollContainer?.getBoundingClientRect().height + this.scrollContainer?.scrollTop === this.scrollContainer?.scrollHeight) return
   if(newPositiion < 0 && this.scrollContainer?.scrollTop === 0  ) return
   this.scrollContainer?.scrollBy(0,newPositiion)
   this.currentScrollPostition += newPositiion
   this.onMouseMoveHandler({clientY:this.currentMouseYPosition, clientX:this.currentMouseXPosition})
  }

  private onMouseMoveHandler(event:{clientY:number, clientX:number}){
    if(!this.eventsContainer || !this.scrollContainer) return
    this.currentMouseYPosition = event.clientY
    this.currentMouseXPosition = event.clientX
    this.setScrollTopInterval(event)
    this.clearScrollTopInterval(event)
    this.setScrollBottomInterval(event)
    this.clearScrollBottomInterval(event)
    this.startY =  this.startTop + this.getApproximatePosition(event.clientY - this.startPosition)  + this.currentScrollPostition 
    this.onSecondPartActions()
    this.restrictStartY()
    this.updateClonePosition(this.startY, this.height)
    this.changeDropContainer(event)
    this.isDragging = true
    this.clone?.classList.add('dragging')

  }

  

  private onMouseUpHandler(){
    if(!this.clone) return
 

    const date = this.eventsContainer?.getAttribute('data-today') || '';
    const dateSecondContainer = this.secondContainer?.getAttribute('data-today') || '';
    const currentDate = DateTime.fromISO(date)
    const secondContainerDate = DateTime.fromISO(dateSecondContainer)
    const seconDate = secondContainerDate.isValid && this.secondPartElement ? secondContainerDate : currentDate
 
    const start = currentDate.toMillis() < seconDate.toMillis() ? currentDate : seconDate
    const end = currentDate.toMillis() < seconDate.toMillis() ?  seconDate : currentDate 
    this.clone.remove();
    this.secondPartElement?.remove()
    const eventelement =  this.elementRef.nativeElement as HTMLElement
    const safeUid = CSS.escape(this.event.uid);
    const elements = document.querySelectorAll(`[data-uid=${safeUid}]`);
    for(const element of elements){
      element.classList.remove('active')
    }

    const newStartDate = start.set({
      hour:this.startDate.hour,
      minute:this.startDate.minute
    })

    const newEndDate = end.set({
      hour:this.endDate.hour,
      minute:this.endDate.minute
    })
    if(!this.isDragging){
      this.openEventInfo(this.elementRef, this.event)
    }else{
      this.onDragEnd.emit({ startDate:newStartDate, endDate:newEndDate});
    }
    
    this.isDragging = false
    this.clearScrollInterval()
    this.secondPartHeight = 0

    this.cleaner$.next()
   
  }


  //============================================================


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

  private  updateEventTime(){
    if(! this.clone) return
     const time = this.clone.querySelector('.time') as HTMLElement
    if(!time) return
    time.innerText = `${this.startDate.toFormat(
        'HH:mm'
        )} - ${ this.endDate.toFormat("HH:mm") === "00:00" ? "24:00" : this.endDate.toFormat("HH:mm")}`;
   
    }

    
  private restrictStartY(){
    if(!this.eventsContainer) return
    if(this.startY > this.eventsContainer?.offsetHeight - this.DELTA_Y){
      this.startY =  this.eventsContainer?.offsetHeight - this.DELTA_Y
    }

    if(this.startY + this.height < this.DELTA_Y){
      this.startY = -this.height + this.DELTA_Y
    }
  }


  private clearScrollInterval(){
    this.scrollInterval.scrollTopInterval && clearInterval(this.scrollInterval.scrollTopInterval) 
    this.scrollInterval.scrollTopInterval = null
    this.scrollInterval.scrollBottomInterval && clearInterval(this.scrollInterval.scrollBottomInterval) 
    this.scrollInterval.scrollBottomInterval = null
  }
  private onSecondPartActions(){
    if(!this.eventsContainer) return
    this.secondPartHeight = 
    this.startY + this.height - this.eventsContainer?.offsetHeight  > 0 
    ? Math.min(this.startHeight - this.DELTA_Y, this.startY + this.height - this.eventsContainer?.offsetHeight )
    :  this.startY < 0 ? Math.max(this.startY,-this.startHeight + this.DELTA_Y )
    : 0

    if(this.secondPartHeight !== 0 && this.scrollContainer){
      const direct = this.secondPartHeight > 0 ? 1 : -1
      const   day  = this.eventsContainer?.getAttribute('data-today') || '';
      const nextDay = DateTime.fromISO(day).plus({day:direct})
      const elements = this.scrollContainer.querySelectorAll('[data-today]');
     this.secondContainer = Array.from(elements).find(el => el.getAttribute('data-today') === nextDay.toISO()) as HTMLElement;
   
      console.log('MMM',  this.secondContainer);
      
      const top = direct > 0 ? this.secondPartHeight - this.startHeight :this.eventsContainer?.offsetHeight + this.secondPartHeight

      if(!this.secondPartElement){
        this.secondPartElement = this.createEvent(top, this.startHeight)

        this.secondContainer?.append( this.secondPartElement)
      }else{
        this.updateEventPositions(top, this.startHeight, this.secondPartElement)
      }
    }else{
      if(this.secondPartElement){
  
        this.secondPartElement.remove()
        this.secondPartElement = null
      }
    }

    
  }
  private updateEventPositions(top:number, height:number, event:HTMLElement){
      console.log('top', top, height);
      
    this.renderer.setStyle(event, 'top', top + 'px');
    this.renderer.setStyle(event, 'height',  height  + 'px');
  }
  
  private  createEvent(top:number, height:number){
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
    width: 100%;
    background:#529ba5;
    box-shadow: 
      0px 6px 10px 0px rgba(0, 0, 0, .14), 
      0px 1px 18px 0px rgba(0, 0, 0, .12), 
      0px 3px 5px -1px rgba(0, 0, 0, .2);
  `;
    event.setAttribute('data-uid', 'null')
    event.style.top = top + 'px';
    event.style.height = height + 'px'
  
  return event
  }

  private changeDropContainer(event:{clientY:number, clientX:number}){
     
      
    let elementFromPoint = this.document.elementFromPoint(
      event.clientX,
       event.clientY
     ); 

     const beforeContainer =  this.eventsContainer
 
     this.eventsContainer = elementFromPoint?.classList.contains(
       'events-container'
     )
       ? elementFromPoint as HTMLElement
       : elementFromPoint?.closest('.events-container') 
       ? elementFromPoint?.closest('.events-container')  as HTMLElement
       : this.eventsContainer  
       

       
       this.secondPartElement && this.secondContainer?.append( this.secondPartElement)

     if (this.eventsContainer !== beforeContainer && this.eventsContainer && this.clone) {
       this.eventsContainer.appendChild(this.clone);
     
     }
  }
  

  private onscrollInterval(type: -1 | 1, ){
    this.scrollContainer?.scrollBy(0,this.DELTA_Y * type)
    this.currentScrollPostition += this.DELTA_Y * type
    this.onMouseMoveHandler({clientY:this.currentMouseYPosition, clientX:this.currentMouseXPosition})
  }


  private setScrollTopInterval(event:{clientY: number}){
    if(!this.eventsContainer) return
    if(!this.scrollContainer) return
  
    
    if ( event.clientY -this.eventsContainer.getBoundingClientRect().top - this.scrollContainer?.scrollTop  < this.DELTA_Y) {
  
      !this.scrollInterval.scrollTopInterval && (this.scrollInterval.scrollTopInterval = setInterval(()=>this.onscrollInterval(-1), 60))
     return
    }
  }
  
  private setScrollBottomInterval(event:{clientY: number}){
    if(!this.eventsContainer) return
    if(!this.scrollContainer) return
    if ( event.clientY  - this.scrollContainer.getBoundingClientRect().top > this.eventsContainerClientHeight - this.DELTA_Y) {
      !this.scrollInterval.scrollBottomInterval && (this.scrollInterval.scrollBottomInterval = setInterval(()=>this.onscrollInterval(1), 60))
     return
    }
  }
  
  private clearScrollBottomInterval(event:{clientY: number}){
    if(!this.eventsContainer) return
    if(!this.scrollContainer) return
   
     
    if  (event.clientY  - this.scrollContainer.getBoundingClientRect().top   < this.scrollContainer.clientHeight - this.DELTA_Y || this.scrollContainer?.scrollTop + this.scrollContainer.clientHeight  >= this.scrollContainer.scrollHeight ) {
      this.scrollInterval.scrollBottomInterval && clearInterval(this.scrollInterval.scrollBottomInterval) 
      this.scrollInterval.scrollBottomInterval = null
    
    }
  } 
  
  private clearScrollTopInterval(event:{clientY: number}){
    if(!this.eventsContainer) return
    if(!this.scrollContainer) return
  
    if (event.clientY  - this.scrollContainer.getBoundingClientRect().top - this.scrollContainer?.scrollTop  > this.DELTA_Y || this.scrollContainer?.scrollTop === 0) {
      this.scrollInterval.scrollTopInterval && clearInterval(this.scrollInterval.scrollTopInterval) 
      this.scrollInterval.scrollTopInterval = null
    
    }
  }  

  private cloneElement(): HTMLElement {
    const clonedElement = this.elementRef.nativeElement.cloneNode(true) as HTMLElement;
    clonedElement.setAttribute('data-uid', 'null')
    return clonedElement;
  }

  private setDate(position:number){
    return this.today
     .startOf('day')
     .plus({hours:Math.floor(position / 60), minutes: position % 60})
   }

   private getApproximatePosition(pos:number){
    return  Math.round( pos / this.DELTA_Y) * this.DELTA_Y 
  }


  private updateClonePosition(top:number, height:number){
    if(!this.eventsContainer) return

    this.startDate = this.setDate(top)
    this.endDate = this.setDate(top + height)
    this.height = height
    this.renderer.setStyle(this.clone, 'top', top + 'px');
    this.renderer.setStyle(this.clone, 'height',  height  + 'px');
    this.updateEventTime()
  }

}
