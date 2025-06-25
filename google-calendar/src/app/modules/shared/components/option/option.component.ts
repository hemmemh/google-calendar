import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-option',
  imports: [],
  templateUrl: './option.component.html',
  styleUrl: './option.component.scss'
})
export class OptionComponent implements OnInit {


  @Input() value!: any
  @Input() label!: string;
  @Output() select = new EventEmitter<any>();

  ngOnInit() {
    if (!this.label) this.label = this.value;
  }

  onSelect(){
    this.select.emit(this.value)
  }
}
