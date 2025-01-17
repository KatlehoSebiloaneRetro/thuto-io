import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemScreenComponent } from './redeem-screen.component';

describe('RedeemScreenComponent', () => {
  let component: RedeemScreenComponent;
  let fixture: ComponentFixture<RedeemScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedeemScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedeemScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
