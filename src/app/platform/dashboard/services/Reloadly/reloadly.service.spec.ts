import { TestBed } from '@angular/core/testing';

import { ReloadlyService } from './reloadly.service';

describe('ReloadlyService', () => {
  let service: ReloadlyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReloadlyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
