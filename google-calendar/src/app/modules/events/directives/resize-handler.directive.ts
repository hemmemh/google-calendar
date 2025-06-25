import { Directive, ElementRef, Inject, Input, Optional } from '@angular/core';
import { ResizableDirective } from './resizable.directive';
import { DOCUMENT } from '@angular/common';
import { filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { DateTime } from 'luxon';

@Directive({
  selector: '[appResizeHandler]'
})
export class ResizeHandlerDirective {

  constructor(
    private resizeHandler: ElementRef,
    @Optional() private resizableDirective: ResizableDirective,
    @Inject(DOCUMENT) private document: Document
  ) {}

  @Input({required:true}) today!: DateTime;
  @Input({required:true}) type!: 'top' | 'bottom';

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

     resizeMove$.subscribe(({ clientY }: MouseEvent) => this.onMouseMoveHandler(clientY));
     resizeEnd$.subscribe((event: MouseEvent) => this.onMouseUpHandler(event));
     this.onMouseDownHandler(event)
    });
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

  onMouseMoveHandler(clientY:number){
    if(!this.eventsContainer) return
    if(!this.eventElement?.classList.contains('resizable'))[
      this.eventElement?.classList.add('resizable')
    ]
    this.resizableDirective.mouseMove.next({ offsetY:clientY - this.eventsContainer?.getBoundingClientRect().top });
  }

  onMouseDownHandler(event:MouseEvent){
      this.eventElement = (this.resizeHandler.nativeElement as HTMLElement).closest('.event-wrapper')
    this.eventsContainer =   this.document.querySelector('.right')

  
    event.preventDefault();
    event.stopPropagation();

    this.resizableDirective.today = this.today
    if(!this.eventElement) return
    
    if(this.type === 'top'){
      this.resizableDirective.mousedown.next({
        top:this.eventElement?.offsetHeight + this.eventElement.offsetTop  ,
        height: this.eventElement.offsetHeight,
        type:this.type
     });
    }else{
      this.resizableDirective.mousedown.next({
        top:this.eventElement.offsetTop ,
        height: this.eventElement.offsetHeight,
        type:this.type
     });
    }


  }

}
