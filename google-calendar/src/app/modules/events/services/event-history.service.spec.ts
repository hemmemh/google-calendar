import { TestBed } from '@angular/core/testing';

import { EventHistoryService } from './event-history.service';

describe('EventHistoryService', () => {
  let service: EventHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
