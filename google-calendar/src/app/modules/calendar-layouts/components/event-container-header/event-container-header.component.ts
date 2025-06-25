import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-event-container-header',
  imports: [],
  templateUrl: './event-container-header.component.html',
  styleUrl: './event-container-header.component.scss'
})
export class EventContainerHeaderComponent  {


 @Input() day!:DateTime 


}
