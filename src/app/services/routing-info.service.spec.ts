import { TestBed } from '@angular/core/testing';

import { RoutingInfoService } from './routing-info.service';

describe('RoutingInfoService', () => {
  let service: RoutingInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoutingInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
