import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AssetsService } from './assets.service';

describe('AssetsService', () => {
  let service: AssetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AssetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
