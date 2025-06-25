import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullDayEventComponent } from './full-day-event.component';

describe('FullDayEventComponent', () => {
  let component: FullDayEventComponent;
  let fixture: ComponentFixture<FullDayEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullDayEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullDayEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
