import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntRewardsContainerComponent } from './rewards-container.component';

describe('RewardsContainerComponent', () => {
  let component: EntRewardsContainerComponent;
  let fixture: ComponentFixture<EntRewardsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntRewardsContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntRewardsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
