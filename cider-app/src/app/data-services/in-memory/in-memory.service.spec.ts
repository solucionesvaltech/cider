import { Deck } from '../types/deck.type';

import { InMemoryService } from './in-memory.service';

describe('InMemoryService', () => {
  // InMemoryService is a generic, non-injectable base class — it is
  // constructed directly rather than resolved through TestBed.
  let service: InMemoryService<Deck, number>;

  beforeEach(() => {
    service = new InMemoryService<Deck, number>();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
