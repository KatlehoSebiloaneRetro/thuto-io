import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectStatComponent } from './subject-stat.component';

describe('SubjectStatComponent', () => {
  let component: SubjectStatComponent;
  let fixture: ComponentFixture<SubjectStatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubjectStatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
