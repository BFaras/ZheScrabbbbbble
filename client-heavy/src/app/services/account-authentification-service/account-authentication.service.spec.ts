import { TestBed } from '@angular/core/testing';

import { AccountAuthenticationService } from './account-authentication.service';

describe('AccountAuthenticationService', () => {
  let service: AccountAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
