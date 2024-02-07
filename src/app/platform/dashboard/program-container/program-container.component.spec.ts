import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramContainerComponent } from './program-container.component';

describe('ProgramContainerComponent', () => {
  let component: ProgramContainerComponent;
  let fixture: ComponentFixture<ProgramContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
