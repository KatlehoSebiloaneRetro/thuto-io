import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSplashComponent } from './login-splash.component';

describe('LoginSplashComponent', () => {
  let component: LoginSplashComponent;
  let fixture: ComponentFixture<LoginSplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginSplashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
