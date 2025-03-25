import { TestBed } from '@angular/core/testing';

import { StayBackService } from './stay-back.service';

describe('StayBackService', () => {
  let service: StayBackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StayBackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
