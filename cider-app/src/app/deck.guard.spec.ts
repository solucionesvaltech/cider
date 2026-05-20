import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DeckGuard } from './deck.guard';

describe('DeckGuard', () => {
  let guard: DeckGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    guard = TestBed.inject(DeckGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
