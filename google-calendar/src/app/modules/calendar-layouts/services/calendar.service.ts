import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor() { }


   cloneContent(content:HTMLElement,className:string = '',before:boolean = true){
    const element = content
  
   
    const parrent = element.parentElement
    const clone = element.cloneNode(true) as HTMLElement;
    console.log('ell', element.firstElementChild);
    clone.style.position = 'absolute'
    clone.style.left = '0'
    clone.style.top = '0'
    clone.style.opacity = '0'
    clone.style.zIndex = '-1'
    clone.style.width = '100%'


    clone.classList.add('clone')
    clone.classList.add('main')
    parrent && parrent.append(clone)
    if (className.length !== 0) {
      const cloneWeek = clone.querySelector(className)
      const week = element.firstElementChild?.querySelector(className)
      if (!week) return
      cloneWeek?.scroll(0, week.scrollTop)
    }
    if (before) {
      element.firstElementChild?.classList.add('active-before')
    }else{
      element.firstElementChild?.classList.add('active')
    }
    
    setTimeout(() => {
      clone.remove()
      if (before) {
        element.firstElementChild?.classList.remove('active-before')
      }else{
        element.firstElementChild?.classList.remove('active')
      }
    
    }, 200);
  }

  

  getCurrentWeek(currentDate: DateTime) {
 
    let weekStart = currentDate.startOf('week');
    let days = [];
  
    for (let i = 0; i <= 6; i++) {
      const day = weekStart.plus({ days: i }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      days.push(day);
    }
  
    return days;
  }
}
