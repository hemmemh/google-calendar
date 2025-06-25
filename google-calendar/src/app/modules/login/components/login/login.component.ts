import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule,MatButtonModule, MatInputModule],
  providers:[LoginService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  constructor(private loginService:LoginService){}


  loginForm : FormGroup = new FormGroup({
    "email": new FormControl('',[Validators.required, Validators.email]),
    "password": new FormControl('', [Validators.required])
});

  login(){
    this.loginService.login(this.loginForm.value)
  }

  registration(){
    this.loginService.registration(this.loginForm.value)
  }

}
