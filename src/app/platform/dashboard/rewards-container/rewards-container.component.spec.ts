import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardsContainerComponent } from './rewards-container.component';

describe('RewardsContainerComponent', () => {
  let component: RewardsContainerComponent;
  let fixture: ComponentFixture<RewardsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RewardsContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RewardsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
