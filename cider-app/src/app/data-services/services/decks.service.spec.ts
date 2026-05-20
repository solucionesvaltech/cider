import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DecksService } from './decks.service';

describe('DecksService', () => {
  let service: DecksService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(DecksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
