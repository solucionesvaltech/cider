import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CardAttributesService } from './card-attributes.service';

describe('CardAttributesService', () => {
  let service: CardAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CardAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
