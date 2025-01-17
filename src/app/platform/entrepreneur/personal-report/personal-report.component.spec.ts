import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalReportComponent } from './personal-report.component';

describe('PersonalReportComponent', () => {
  let component: PersonalReportComponent;
  let fixture: ComponentFixture<PersonalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
