import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-view',
  imports: [LoginComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {

}
