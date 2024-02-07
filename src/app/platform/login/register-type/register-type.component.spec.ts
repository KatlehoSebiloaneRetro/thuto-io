import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTypeComponent } from './register-type.component';

describe('RegisterTypeComponent', () => {
  let component: RegisterTypeComponent;
  let fixture: ComponentFixture<RegisterTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
