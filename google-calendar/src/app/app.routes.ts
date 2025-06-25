import { Routes } from '@angular/router';
import { ViewComponent as CalendarLayout } from './modules/calendar-layouts/components/view/view.component';
import { DayCalendarComponent } from './modules/calendar-layouts/components/day-calendar/day-calendar.component';
import { ViewComponent as Login } from './modules/login/components/view/view.component';
import { WeekCalendarComponent } from './modules/calendar-layouts/components/week-calendar/week-calendar.component';

export const routes: Routes = [

    {
        path:'login',
        component:Login
    },
    {
        path:'',
        redirectTo:`day/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`,
        pathMatch: 'full',
    },
    {
        path:'',
        component:CalendarLayout,
        children:[
            {
                path:'day/:year/:month/:date',
                component:DayCalendarComponent
            }
        ]
    },
    {
        path:'',
        component:CalendarLayout,
        children:[
            {
                path:'week/:year/:month/:date',
                component:WeekCalendarComponent
            }
        ]
    }
];
