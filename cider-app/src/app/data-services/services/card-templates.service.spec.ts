import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CardTemplatesService } from './card-templates.service';

describe('CardTemplatesService', () => {
  let service: CardTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CardTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
