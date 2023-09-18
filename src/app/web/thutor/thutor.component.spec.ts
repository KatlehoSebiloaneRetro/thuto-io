import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThutorComponent } from './thutor.component';

describe('ThutorComponent', () => {
  let component: ThutorComponent;
  let fixture: ComponentFixture<ThutorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThutorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
