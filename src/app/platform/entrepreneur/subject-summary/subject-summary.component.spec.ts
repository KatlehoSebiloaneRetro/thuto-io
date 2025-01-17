import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectSummaryComponent } from './subject-summary.component';

describe('SubjectSummaryComponent', () => {
  let component: SubjectSummaryComponent;
  let fixture: ComponentFixture<SubjectSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubjectSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
