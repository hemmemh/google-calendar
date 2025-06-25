import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Token } from '../models/token.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  constructor(private http: HttpClient) { }

  login(login: Pick<User, 'email' | 'password'>): Observable<Token> {
    return this.http.post<Token>(`${environment.apiUrl}/user/login`, login);
  }

  deleteUser(user: User): Observable<Token> {
    return this.http.delete<Token>(`${environment.apiUrl}/user/${user.uid}`);
  }

  logout(): Observable<Token> {
    return this.http.get<Token>(`${environment.apiUrl}/user/logout`, { withCredentials: true });
  }

  registration(registration: Pick<User, 'email' | 'password'>): Observable<Token> {
    return this.http.post<Token>(`${environment.apiUrl}/user/registration`, registration);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/user/getProfile`);
  }

}
