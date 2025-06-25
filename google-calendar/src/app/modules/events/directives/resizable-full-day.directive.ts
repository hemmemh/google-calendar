import { Directive, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appResizableFullDay]'
})
export class ResizableFullDayDirective {

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) { }

  @Output() onResizeMove: EventEmitter<{ height: number, top: number, bottom: number }> = new EventEmitter();
  @Output() onResizeEnd: EventEmitter<{startDate:DateTime,endDate:DateTime}> = new EventEmitter()
  @Input({required:true}) days!:number
  @Input({required:true}) startDate!:DateTime
  @Input({required:true}) endDate!:DateTime

  
    private cleaner$ = new Subject<void>()
    private destroy$ = new Subject<void>()

    eventsContainer:HTMLElement | null = null

    elementX:number = 0
    elementWidth:number = 0
    eventElement:HTMLElement | null = null
    startX:number = 0
    startEnd:number = 0
    startWidth:number = 0
    dragNumber = 0
  
    ngOnDestroy(): void {
      this.destroy$.next()
      this.destroy$.complete()
      this.cleaner$.complete()
    }

    public mousedown = new Subject<{
      offsetLeft:number, 
      offsetWidth:number, 
      eventsContainer:HTMLElement, 
      type:'left' | 'right'
    }>()


  public mouseMove = new Subject<{ offsetX: number }>()
     type:'left' | 'right' = 'left'

     
  public resizeEnd = new Subject()

      
      ngAfterViewInit(): void {
        this.mousedown
        .pipe(takeUntil(this.destroy$))
        .subscribe(({offsetLeft, offsetWidth, eventsContainer,  type}) =>{
    
          this.mouseMove.pipe(takeUntil(this.cleaner$)).subscribe((event) =>{
            this.onMoveHandler(event)
          });
      
          this.resizeEnd.pipe(takeUntil(this.cleaner$)).subscribe((event) => this.mouseUpHandler())
    
          this.mouseDownHandler(offsetLeft, offsetWidth, eventsContainer,  type)
        });
    
    
       
    
      }
  

      mouseDownHandler(offsetLeft:number, offsetWidth:number, eventsContainer:HTMLElement,   type:'left' | 'right'){
     
        this.eventElement = this.elementRef.nativeElement
        this.startX =   offsetLeft / eventsContainer.offsetWidth * 100
   
        const container = eventsContainer
  
        const containerWidth = container.offsetWidth
        this.startWidth = (Math.round( containerWidth / this.days) / containerWidth) * 100
      
        this.elementX = this.startX
        this.elementWidth = offsetWidth / eventsContainer.offsetWidth * 100
        this.startEnd = this.startX +  this.elementWidth 
        this.eventsContainer = eventsContainer
        this.type = type
    
    }


    private  onMoveHandler(event:{offsetX:number}){

      if(!this.eventsContainer) return
      const newPosition = (event.offsetX  / this.eventsContainer.offsetWidth) * 100
      
       
     if(this.type === 'right'){
      if(newPosition > this.elementX + this.elementWidth){
        this.elementWidth+=this.startWidth
        this.endDate = this.endDate.plus({day:1})
 
      }
     
         
        if(newPosition <  this.elementX + this.elementWidth - this.startWidth && newPosition >  this.startX   && this.elementWidth !== this.startWidth){
          this.elementWidth-=this.startWidth
          this.endDate = this.endDate.minus({day:1})
        }
     }

     if(this.type === 'left'){
      if(newPosition < this.elementX){
        this.elementX-=this.startWidth
        this.elementWidth+=this.startWidth
        this.startDate = this.startDate.minus({day:1})

      
      }
      if(newPosition > this.elementX + this.startWidth && newPosition < this.startEnd ){
        console.log('JKK1',   this.elementWidth, this.elementWidth);
        this.elementX+=this.startWidth
        this.elementWidth-=this.startWidth
        this.startDate = this.startDate.plus({day:1})
  
        console.log('JKK2',   this.dragNumber);
      }
   
     }

 
     this.updateEventPositions(this.elementX, this.elementWidth)
    }
    

    private mouseUpHandler(){
    
 
      this.onResizeEnd.emit({startDate:this.startDate, endDate:this.endDate})
      this.dragNumber = 0
        this.cleaner$.next()
    }


    
    private updateEventPositions(left:number, width:number){
      if(!this.eventsContainer) return

      this.renderer.setStyle(this.eventElement, 'left', left + '%');
      this.renderer.setStyle(this.eventElement, 'width',  width  + '%');
    }
    

}
