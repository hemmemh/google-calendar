import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullDayEventContainerComponent } from './full-day-event-container.component';

describe('FullDayEventContainerComponent', () => {
  let component: FullDayEventContainerComponent;
  let fixture: ComponentFixture<FullDayEventContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullDayEventContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullDayEventContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
