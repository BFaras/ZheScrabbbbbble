import { TestBed } from '@angular/core/testing';

import { PreviewPlayersActionService } from './preview-players-action.service';

describe('PreviewPlayersActionService', () => {
  let service: PreviewPlayersActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviewPlayersActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
