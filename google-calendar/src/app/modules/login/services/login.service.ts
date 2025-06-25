import { Injectable } from '@angular/core';
import { AuthApiService } from '../../../api/auth.api.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn:'root'
})
export class LoginService {

  private user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null)
  public user$: Observable<User | null> = this.user.asObservable()

  constructor(
    private authApiService:AuthApiService,
    private snackBar:MatSnackBar,
    private router:Router,
   ) { }

  set User(user:User | null) {
    this.user.next(user)
  }

  get User() {
    return this.user.getValue()
   }

  async login(login: Pick<User, 'email' | 'password'>) {
    try {
      const data = await  firstValueFrom(this.authApiService.login(login))
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("userId", data.user.uid);
      await this.getProfile()
      this.snackBar.open('Успешная авторизация', '', {duration:3000})
      console.log('user', this.User);
      
      this.router.navigate([`day/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`])
    } catch (error:any) {
      this.snackBar.open(error.error.message, '', {duration:3000})
    }
  }

  async deleteUser() {
    const user = this.User
    if(!user) return
    await  firstValueFrom(this.authApiService.deleteUser(user))
    this.logout()
  }

 async  logout() {
    await  firstValueFrom(this.authApiService.logout())
    localStorage.removeItem("access_token");
    localStorage.removeItem("userId");
    this.User = null
    this.router.navigate([`/login`])
  }

  async registration(registration: Pick<User, 'email' | 'password'>) {
    try {
      const data = await  firstValueFrom(this.authApiService.registration(registration))
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("userId", data.user.uid);
      await this.getProfile()
      this.snackBar.open('Успешная регистраация', '', {duration:3000})
      this.router.navigate([`day/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`])
    } catch (error:any) {
      this.snackBar.open(error.error.message, '', {duration:3000})
    }
   

  }

  async getProfile() {
       const user = await firstValueFrom(this.authApiService.getProfile())
       console.log('user', user);
       
       this.User = user
  }

}
