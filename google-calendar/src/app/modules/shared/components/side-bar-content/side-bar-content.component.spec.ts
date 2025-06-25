import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarContentComponent } from './side-bar-content.component';

describe('SideBarContentComponent', () => {
  let component: SideBarContentComponent;
  let fixture: ComponentFixture<SideBarContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
