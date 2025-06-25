import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { EventHistoryService } from '../../events/services/event-history.service';
import { ChangeEnum } from '../../../enums/change.enum';
export type NavType = 'year' | 'month' | 'day' | 'week'

@Injectable()
export class HeaderService {

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private snackBar: MatSnackBar,
    private eventHistoryService:EventHistoryService,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  prevHandler(dateParams:Params) {
    let current = DateTime.now()
    current = DateTime.fromObject({year:dateParams['year'], month:Number(dateParams['month']) , day:dateParams['date']}) as DateTime

    const defaultRoute = this.router.url.split("/").splice(0,2).join("/")
    let changeType = this.router.url.split("/").splice(0,3)[1]

    let newDate =  DateTime.now()

    newDate = current.minus({ [changeType]: 1 });

    
    this.router.navigate([defaultRoute,newDate.year, newDate.month, newDate.day ])
  }



  nextHandler(dateParams:Params) {
    let current = DateTime.now()
    current = DateTime.fromObject({year:dateParams['year'], month:Number(dateParams['month']), day:dateParams['date']}) as DateTime
    const defaultRoute = this.router.url.split("/").splice(0,2).join("/")
    let changeType = this.router.url.split("/").splice(0,3)[1]
    let newDate =  DateTime.now()
    newDate = current.plus({ [changeType]: 1 });
    this.router.navigate([defaultRoute,newDate.year, newDate.month, newDate.day ])
  }

  navigateByNavType(dateParams:Params, navType:NavType) {
    //this.dateService.setDate(moment([dateParams['year'], dateParams['month'], dateParams['day']]))
    console.log('date',  dateParams['month']);
    
    this.router.navigate([navType, dateParams['year'], dateParams['month'], dateParams['date']])
  }

  navigateToToday() {
    const params = this.route.snapshot.firstChild?.params
     
    if (!params) return
 
    
    const paramsToDay = DateTime.fromObject({year:+params['year'], month:+params['month'] ,day:+params['date']})
    const newDate  =DateTime.now()
    console.log(paramsToDay,newDate);
  
    if (paramsToDay.startOf('day').toMillis() === newDate.startOf('day').toMillis()) {
 
      const content = this.document.querySelector('.contain')
      content &&  content.scroll({behavior:'smooth', top:400})
      return
    }
    
    const defaultRoute = this.router.url.split("/").splice(0,2).join("/")
   // this.dateService.setDate(newDate)
    this.router.navigate([defaultRoute,newDate.year, newDate.month, newDate.day ])
  }

    async undo(){
      
      const lastChanges = await this.eventHistoryService.onSetUndoArray() 
      if (!lastChanges) return null
  
      this.snackBar.open(`${ChangeEnum[lastChanges[0].undo.method]}   события ${ChangeEnum.undo}`, undefined,{
        duration: 2000
      }); 
  
      return null
    }
  
   async redo(){
    
      const lastChanges = await this.eventHistoryService.onSetRedoArray()
      if (!lastChanges) return null
  
      this.snackBar.open(`${ChangeEnum[lastChanges[0].undo.method]} события ${ChangeEnum.redo}`, undefined,{
        duration: 2000
      }); 
      return null
    }
  

}
