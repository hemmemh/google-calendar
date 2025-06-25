import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateEventDTO } from '../dtos/create-event.dto';
import { UpdateEventDTO } from '../dtos/update-event.dto';
import { EventModel } from '../models/event.model';
import { environment } from '../../environments/environment';
import { GetEventsByParamsDTO } from '../dtos/get-events-by-params.dto';
import { Observable } from 'rxjs';
import { EventChange, EventChangeObj } from '../interfaces/event-change';

@Injectable({
  providedIn: 'root'
})
export class EventsApiService {

  constructor(private http: HttpClient) { }



  create(dto:CreateEventDTO): Observable<EventChange[]>{
    return this.http.post<EventChange[]>(`${environment.apiUrl}/events/create`, dto);
  }

  update(dto:UpdateEventDTO): Observable<EventChange[]>{
    return this.http.post<EventChange[]>(`${environment.apiUrl}/events/update`, dto);
  }

  delete(uid:string, all:boolean): Observable<EventChange[]>{
    const params = new HttpParams()
    .append('all', all)

    return this.http.delete<EventChange[]>(`${environment.apiUrl}/events/delete/${uid}`, {params});
  }

  getByParams(dto:GetEventsByParamsDTO){
    const {endDate, startDate, userUid} = dto
    const params = new HttpParams()
    .append('endDate', endDate)
    .append('startDate',startDate)
    .append('userUid', userUid)
    return this.http.get<EventModel[]>(`${environment.apiUrl}/events/getEventsByParams`, {params});
  }

  changeEvent(EventChange:EventChangeObj){
    return this.http.post(`${environment.apiUrl}/events/change`,EventChange);
  }

}




