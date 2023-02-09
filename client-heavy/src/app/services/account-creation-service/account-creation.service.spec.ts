import { TestBed } from '@angular/core/testing';

import { AccountCreationService } from './account-creation.service';

describe('AccountCreationService', () => {
  let service: AccountCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
