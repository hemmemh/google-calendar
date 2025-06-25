import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventContainerHeaderComponent } from './event-container-header.component';

describe('EventContainerHeaderComponent', () => {
  let component: EventContainerHeaderComponent;
  let fixture: ComponentFixture<EventContainerHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventContainerHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventContainerHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
