import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashContainerComponent } from './dash-container.component';

describe('DashContainerComponent', () => {
  let component: DashContainerComponent;
  let fixture: ComponentFixture<DashContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
