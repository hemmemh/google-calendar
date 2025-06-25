import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDateComponent } from '../change-date/change-date.component';
import { HeaderService, NavType } from '../../services/header.service';
import { ActivatedRoute, ActivationEnd, Params, Router } from '@angular/router';
import { distinctUntilChanged, filter, fromEvent, Subject, takeUntil } from 'rxjs';
import { LoginService } from '../../../login/services/login.service';
import { User } from '../../../../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventHistoryService } from '../../../events/services/event-history.service';
import { ChangeEnum } from '../../../../enums/change.enum';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, MatIconModule, ChangeDateComponent, CommonModule],
  providers:[HeaderService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {

  dateParams:Params | null = null
  user:User | null = null
  undoActive:boolean = false
  redoActive:boolean = false

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(
    private headerService:HeaderService,
    private loginService:LoginService,
    private router:Router,
    @Inject(DOCUMENT) private document: Document,
    private eventHistoryService:EventHistoryService,

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
  ngOnInit(): void {
      this.loginService.user$.subscribe(user => {
     this.user = user
      })

      this.eventHistoryService.undoArray$
      .subscribe(data=>{
        if (data.length === 0) {
          this.undoActive = false
        }else{
          this.undoActive = true
        }
      })
    
    
      this.eventHistoryService.redoArray$.subscribe(data=>{
        if (data.length === 0) {
          this.redoActive = false
        }else{
          this.redoActive = true
        }
     
      })

        fromEvent<KeyboardEvent>(this.document, 'keydown')
        .pipe(takeUntil(this.destroy$))
        .subscribe(async (event) => {
          await this.eventHistoryService.actionOnKeyPress(event)
        
        });
      

  }

  async undo(){
      this.headerService.undo()
  }

 async redo(){
  this.headerService.redo()
  }

  logout(){
    this.loginService.logout()
  }

  navigateByNavType(navType:NavType){
    if(!this.dateParams) return
    this.headerService.navigateByNavType(this.dateParams, navType)
   }
}
