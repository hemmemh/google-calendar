import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTextAreaComponent } from './my-text-area.component';

describe('MyTextAreaComponent', () => {
  let component: MyTextAreaComponent;
  let fixture: ComponentFixture<MyTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTextAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
