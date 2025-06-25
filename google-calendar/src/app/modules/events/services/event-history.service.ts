import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventsService } from './events.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { EventChange } from '../../../interfaces/event-change';
import { EventsApiService } from '../../../api/events.api.service';
import { ChangeEnum } from '../../../enums/change.enum';
import { EventsStorageService } from './events-storage.service';

@Injectable({
  providedIn: 'root'
})
export class EventHistoryService {




  constructor(
    private snackBar: MatSnackBar,
    private eventsApiService:EventsApiService,
    private eventsStorageService:EventsStorageService,
    ) { 
      console.log('EventHistoryService instance:', this);
    }

  public undoArray$ = new BehaviorSubject<EventChange[][]>([]);
  public redoArray$ = new BehaviorSubject<EventChange[][]>([]);
  public isChanged$ = new BehaviorSubject<boolean>(true);


  public setUndoArray(EventChange: EventChange[]) {
    console.log('setUndo', EventChange);
    
    this.undoArray$.next([...this.undoArray$.getValue(), EventChange]);
  }

  public setRedoArray(EventChange: EventChange[]) {
    this.redoArray$.next([...this.redoArray$.getValue(),EventChange]);
  }
  
  public  popUndoArray() {
    const values = this.undoArray$.getValue();
    const sliceValues = values.slice(0, values.length - 1)
   
    return   this.undoArray$.next(sliceValues);
  

  }

  public  popRedoArray() {
    const values = this.redoArray$.getValue();
    const sliceValues = values.slice(0, values.length - 1)
   
    return   this.redoArray$.next(sliceValues);
  

  }

  
  public  getUndoLastChanges() {
    const values = this.undoArray$.getValue();
    if (values.length !== 0) {
      const lastChanges = values[values.length-1]
   
      return lastChanges
    }
    return null
  
  

  }


  public  getRedoLastChanges() {
    const values = this.redoArray$.getValue();
    if (values.length !== 0) {
      const lastChanges = values[values.length-1]
   
      return lastChanges
    }
      return null

  }


  public getUndoArray() {
    return this.undoArray$.getValue();

  }


  public getRedoArray() {
    return this.redoArray$.getValue();

  }

  public async onSetRedoArray(){
    if (this.isChanged$.getValue() === false) {
      return null
    }
    const lastChanges = this.getRedoLastChanges()
    if(!lastChanges) return null

    this.isChanged$.next(false)

    for(const change of lastChanges){
      const redoLastChanges = change.redo

      await firstValueFrom(this.eventsApiService.changeEvent(redoLastChanges))
      
      switch(redoLastChanges.method){
    
        case 'delete' :this.eventsStorageService.add(redoLastChanges.obj)
        break
        case 'update' :this.eventsStorageService.replace(redoLastChanges.obj)
        break
        case 'create' :this.eventsStorageService.filter(redoLastChanges.obj.uid)
        break
      }
    }


    this.isChanged$.next(true)
    this.popRedoArray()
    if (lastChanges) {
      this.setUndoArray(lastChanges)
    }

    return lastChanges
   
    
  }

  public async onSetUndoArray(){

    if (this.isChanged$.getValue() === false) {
      return null
    }

    const lastChanges = this.getUndoLastChanges()
          if(!lastChanges) return null
          this.isChanged$.next(false)

          for(const change of lastChanges){
            const undoLastChanges = change.undo

            await firstValueFrom(this.eventsApiService.changeEvent(undoLastChanges))
  
            switch(undoLastChanges.method){
              case 'delete' :this.eventsStorageService.add(undoLastChanges.obj)
              break
              case 'update' :this.eventsStorageService.replace(undoLastChanges.obj)
              break
              case 'create' :this.eventsStorageService.filter(undoLastChanges.obj.uid)
              break
            }
          }

      
          this.isChanged$.next(true)
          this.popUndoArray()
          if (lastChanges) {
            this.setRedoArray(lastChanges)
          }
  
          return lastChanges
          
  }


  public async actionOnKeyPress(event:KeyboardEvent){
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyZ') {

      if (event.shiftKey) {
        const lastChanges = await this.onSetRedoArray()
        if (!lastChanges) return null
        this.snackBar.open(`${ChangeEnum[lastChanges[0].undo.method]} Отчета ${ChangeEnum.redo}`, undefined,{
          duration: 2000
        }); 
        return null
    } 

   
      if (event.code === 'KeyZ') {

        const lastChanges = await this.onSetUndoArray()
  
        if (!lastChanges) return null
        this.snackBar.open(`${ChangeEnum[lastChanges[0].undo.method]} Отчета ${ChangeEnum.undo}`, undefined,{
          duration: 2000
       }); 
       
      }

    
    }
    return null
  }
}
