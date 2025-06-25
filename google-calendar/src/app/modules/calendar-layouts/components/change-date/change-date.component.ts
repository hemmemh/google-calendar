import { Component, OnInit } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderService } from '../../services/header.service';
import { ActivationEnd, Params, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-change-date',
  imports: [MatIconModule, MatButtonModule],
  providers:[HeaderService],
  templateUrl: './change-date.component.html',
  styleUrl: './change-date.component.scss'
})
export class ChangeDateComponent {

  constructor(
    private headerService:HeaderService,
    private router:Router
  ){
    this.router.events
    .pipe(
      filter(e => e instanceof ActivationEnd && Object.values(e.snapshot.params).length !== 0),
    )
    .subscribe(event => {
        const params = event as ActivationEnd
        this.dateParams = params.snapshot.params
    })
  }

  dateParams:Params | null = null

  prevHandler(){
    if(!this.dateParams) return
    this.headerService.prevHandler(this.dateParams)
  }

  nextHandler(){
    if(!this.dateParams) return
    this.headerService.nextHandler(this.dateParams)
  }

  navigateToToday(){
    this.headerService.navigateToToday()
  }

}
