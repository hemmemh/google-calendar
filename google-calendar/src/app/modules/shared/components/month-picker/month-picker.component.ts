import { Component, EventEmitter, input, Input, output, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-month-picker',
  imports: [MatIconModule, CommonModule],
  templateUrl: './month-picker.component.html',
  styleUrl: './month-picker.component.scss'
})
export class MonthPickerComponent {

  months = Array.from({ length: 12 }, (_, i) => 
    DateTime.local(2025, i+ 1 ).toFormat('MMMM')  // Форматируем месяц в полный формат
      .charAt(0).toUpperCase() + DateTime.local(2025, i + 1).toFormat('MMMM').slice(1)  // Капитализируем первую букву
  );

  monthsShort = Array.from({ length: 12 }, (_, i) => 
    DateTime.local(2025, i+ 1 ).toFormat('MMMM')  // Форматируем месяц в полный формат
      .charAt(0).toUpperCase() + DateTime.local(2025, i + 1).toFormat('MMM').slice(1)  // Капитализируем первую букву
  );




 
  
  daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  daysMonth:(string | number)[] = []
  today:DateTime = DateTime.now()
  chekedDate:DateTime  | null = this.today
  view:'days' | 'months' | 'years' = 'days'
  @Input() year: number = new Date().getFullYear();
  @Input() month: number = new Date().getMonth();
  startArrayYear = this.year - 9
  years = Array.from({length:24}, (_, i) => this.startArrayYear + i)
  chosenYear = this.year

  @Output() onDayClick = new EventEmitter<{ event: MouseEvent, date: DateTime }>();
  @Output() onMonthChange = new EventEmitter<{ date: { year: number, month: number, day: number } }>();


  ngOnInit(): void {
    console.log('HH', this.months);
    
    this.daysInMonth(this.year, this.month)
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['year'] || changes['month']) {
      console.log('III', this.year, this.month);
      
      this.daysInMonth(this.year, this.month)
    }

   

  }


  ngClassSet(day:number | string):string | string[] | Set<string> | {
    [klass: string]: any;
} | null | undefined{
   
    
    const date = DateTime.fromObject({ year: this.year, month: this.month, day: +day });

  const ppp = {
    'active':this.chekedDate && date.year === this.chekedDate.year && date.month === this.chekedDate.month - 1 && date.day === this.chekedDate.day,
    'today': date.year === this.today.year && date.month === this.today.month - 1  && date.day === this.today.day,
  }
    return ppp
  }


  onClick(event:MouseEvent,day:number | string){

    
    this.chekedDate = DateTime.fromObject({ year: this.year, month: this.month + 1, day: +day });
    this.onDayClick.emit({ event, date: DateTime.fromObject({ year: this.year, month: this.month + 1, day: +day }) });
  }

  onYearClick(year:number){
    this.chosenYear = year
    this.changeView('months')
  }

  onMonthClick(month:number){

     this.month = month
    this.year = this.chosenYear
    this.daysInMonth(this.year, this.month)
    this.onMonthChange.emit({date:{year:this.year, month:this.month, day:1}})
    this.changeView('days')
  }


  changeView( view:'days' | 'months' | 'years'){
      this.view = view
  }
  daysInMonth(year:number, month:number){

    

    this.daysMonth = []

    

    
    const day = DateTime.fromObject({ year, month: month + 1  , day: 1 }).weekday
    const daysInMonth = DateTime.fromObject({ year, month: month  + 1  }).daysInMonth as number;

    const ccc = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    if (day !== 0) {
      const blank:(number | string)[] = Array(day - 1)
    blank.fill('')
 
  
     this.daysMonth = [...blank, ...ccc]
    
    }else{
      this.daysMonth = ccc
    }
   
    console.log('blank', this.daysMonth); 
 
  }

  toNextMonth(){
       console.log('m', this.month);
     
    if (this.month === 11) {
      this.month = 0
      this.year += 1
      this.daysInMonth(this.year, this.month)
      this.onMonthChange.emit({date:{year:this.year, month:this.month, day:1}})
      return
    }
    this.month+=1
    this.daysInMonth(this.year, this.month)
    this.onMonthChange.emit({date:{year:this.year, month:this.month, day:1}})
  }

  toNextYears(){
    this.startArrayYear+=24
  this.years = Array.from({length:24}, (_, i) => this.startArrayYear + i)
  }

  toPrevYears(){
    this.startArrayYear-=24
  this.years = Array.from({length:24}, (_, i) => this.startArrayYear + i)
  }

  toNextChosenYear(){
   this.chosenYear+=1
  }

  toPrevChosenYear(){
    this.chosenYear-=1
  }

  toPrevMonth(){
    console.log('month',this.month   );
    
    if (this.month === 0) {
      this.month =11
      this.year -= 1
      this.daysInMonth(this.year, this.month)
      this.onMonthChange.emit({date:{year:this.year, month:this.month, day:1}})
      return
    }
    this.month-=1
    this.daysInMonth(this.year, this.month)
    this.onMonthChange.emit({date:{year:this.year, month:this.month, day:1}})
  }

}


