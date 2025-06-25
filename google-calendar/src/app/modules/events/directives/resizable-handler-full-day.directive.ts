import { Directive, ElementRef, Inject, Input, Optional } from '@angular/core';
import { filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { ResizableFullDayDirective } from './resizable-full-day.directive';
import { DOCUMENT } from '@angular/common';
import { DateTime } from 'luxon';

@Directive({
  selector: '[appResizableHandlerFullDay]'
})
export class ResizableHandlerFullDayDirective {

  constructor(
    private resizeHandler: ElementRef,
    @Optional() private resizableDirective: ResizableFullDayDirective,
    @Inject(DOCUMENT) private document: Document
  ) {}

  @Input({required:true}) type!: 'left' | 'right';



    private cleaner$ = new Subject<void>()
    private destroy$ = new Subject<void>()

    eventElement:HTMLElement | null = null
    eventsContainer:HTMLElement | null = null

    ngOnDestroy(): void {
      this.destroy$.next()
      this.destroy$.complete()
      this.cleaner$.complete()
    }


    
      ngOnInit(): void {
        const resizeStart$ = fromEvent<MouseEvent>(this.resizeHandler.nativeElement,'mousedown')
         .pipe(filter(el => el.button === 0))
        .pipe(takeUntil(this.destroy$));
    
        const resizeMove$ = fromEvent<MouseEvent>(this.document, 'mousemove')
        .pipe(filter(el => el.button === 0))
        .pipe(takeUntil(this.cleaner$));
    
        const resizeEnd$ = fromEvent<MouseEvent>(this.document, 'mouseup')
        .pipe(filter(el => el.button === 0))
        .pipe(takeUntil(this.cleaner$));
    
        resizeStart$.subscribe((event: MouseEvent) => {
    
         resizeMove$.subscribe(({ clientX }: MouseEvent) => this.onMouseMoveHandler(clientX));
         resizeEnd$.subscribe((event: MouseEvent) => this.onMouseUpHandler(event));
         this.onMouseDownHandler(event)
        });
      }


      onMouseDownHandler(event:MouseEvent){
          this.eventElement = (this.resizeHandler.nativeElement as HTMLElement).closest('.event-wrapper')
        const target = event.target as HTMLElement
      this.eventsContainer = target.closest('.full-day-events-container')
      if(!this.eventsContainer) return
        event.preventDefault();
        event.stopPropagation();
    
    
   
        if(!this.eventElement) return
        
        this.resizableDirective.mousedown.next({
          offsetLeft:this.eventElement.offsetLeft,
          offsetWidth:this.eventElement.offsetWidth,
          eventsContainer:this.eventsContainer,
          type:this.type
       });
    
    
      }

      onMouseMoveHandler(clientX:number){
        if(!this.eventsContainer) return
        if(!this.eventElement?.classList.contains('resizable')){
          this.eventElement?.classList.add('resizable')
        }

        
        this.resizableDirective.mouseMove.next({ offsetX:clientX - this.eventsContainer?.getBoundingClientRect().left });
      }

      onMouseUpHandler(event:MouseEvent){
    
        this.resizableDirective.resizeEnd.next({})
        event.preventDefault();
        event.stopPropagation();
        if(this.eventElement?.classList.contains('resizable'))[
          this.eventElement?.classList.remove('resizable')
        ]
        this.cleaner$.next()
      }
    

}
