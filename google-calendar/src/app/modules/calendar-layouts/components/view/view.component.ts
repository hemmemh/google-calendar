import { Component } from '@angular/core';
import { LeftBarComponent } from '../left-bar/left-bar.component';
import { HeaderComponent } from '../header/header.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../login/services/login.service';
import { SideBarComponent } from '../../../shared/components/side-bar/side-bar.component';
import { SideBarContentComponent } from '../../../shared/components/side-bar-content/side-bar-content.component';
import { SideBarContainerComponent } from "../../../shared/components/side-bar-container/side-bar-container.component";

@Component({
  selector: 'app-view',
  imports: [LeftBarComponent, HeaderComponent, MatSidenavModule, RouterOutlet, MatIconModule, MatButtonModule, CommonModule, SideBarComponent, SideBarContentComponent, SideBarContainerComponent, SideBarContainerComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {

  constructor(private loginService:LoginService){
    const user = loginService.User
    if(!user){
      loginService.getProfile()
    }
  
  }

  opened = true

  setOpened(){
    this.opened = !this.opened
  }
}
