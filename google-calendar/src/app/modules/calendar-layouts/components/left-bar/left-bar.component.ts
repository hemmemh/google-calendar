import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MonthPickerComponent } from '../../../shared/components/month-picker/month-picker.component';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-left-bar',
  imports: [MonthPickerComponent],
  templateUrl: './left-bar.component.html',
  styleUrl: './left-bar.component.scss'
})
export class LeftBarComponent {

   constructor(
    private route:ActivatedRoute,
    private router:Router,
    private cdr:ChangeDetectorRef
  ){


    this.router.events
    .pipe(
      filter(e => e instanceof ActivationEnd && Object.values(e.snapshot.params).length !== 0),
    )
    .subscribe(event => {
      const params = event as ActivationEnd
      const data = params.snapshot.params
        this.today = DateTime.fromObject({year:+data['year'], month: Number(data['month']), day:+data['date']})
        this.cdr.markForCheck()
    })
  
  }

   private destroy$ = new Subject<void>();
  
    today:DateTime =DateTime.now();

   ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
   }


   onDateClick(date:DateTime){
    this.navigateByMonthCalendar(date)
  }


  navigateByMonthCalendar(date:DateTime){
    const params = this.route.snapshot.children[0].params
    const currentDate = DateTime.fromObject({
      year: params['year'],
      month: params['month'],
      day: params['date']
    }).startOf('day');
    
    const defaultRoute = this.router.url.split("/").splice(0, 2).join("/");
    let changeType = this.router.url.split("/").splice(0, 2)[1];
    
    let newDate = DateTime.now(); // Default to current date and time
    
    if (changeType == "day") {
      const difDay = currentDate.diff(date.startOf('day'), 'days').days;
      newDate = currentDate.minus({ days: difDay }) as DateTime;
    } 
    if (changeType == "week") {
      const difWeek = currentDate.startOf('week').diff(date.startOf('week'), 'days').days / 7;
      newDate = currentDate.minus({ weeks: difWeek })  as DateTime;
    } 
    if (changeType == "month") {
      const difMonth = currentDate.month - date.month + ((currentDate.year * 12) - (date.year * 12));
      newDate = currentDate.minus({ months: difMonth })  as DateTime;
    } 
    if (changeType == "year") {
      const difYear = currentDate.year - date.year;
      newDate = currentDate.minus({ years: difYear })  as DateTime;
    }
  
    this.router.navigate([defaultRoute,newDate.year, newDate.month, newDate.day ])

  }

}
