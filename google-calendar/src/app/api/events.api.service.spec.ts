import { TestBed } from '@angular/core/testing';

import { EventsApiService } from './events.api.service';

describe('EventService', () => {
  let service: EventsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
