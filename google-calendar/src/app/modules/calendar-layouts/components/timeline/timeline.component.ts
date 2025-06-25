import { Component } from '@angular/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-timeline',
  imports: [],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {

  times  = Array.from({length:23}, (_, i)=>  DateTime.now()
  .set({ hour: i + 1, minute: 0 })  // Устанавливаем час и минуты
  .toFormat('HH:mm'))
}
