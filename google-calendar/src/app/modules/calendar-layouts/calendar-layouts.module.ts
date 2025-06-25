import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './components/view/view.component';
import { LeftBarComponent } from './components/left-bar/left-bar.component';
import { HeaderComponent } from './components/header/header.component';
import { DayCalendarComponent } from './components/day-calendar/day-calendar.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class CalendarLayoutsModule { }
