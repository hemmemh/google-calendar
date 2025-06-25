import { TestBed } from '@angular/core/testing';

import { EventsStorageService } from './events-storage.service';

describe('EventsStorageService', () => {
  let service: EventsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
