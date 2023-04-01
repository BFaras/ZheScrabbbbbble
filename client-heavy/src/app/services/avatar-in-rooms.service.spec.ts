import { TestBed } from '@angular/core/testing';

import { AvatarInRoomsService } from './avatar-in-rooms.service';

describe('AvatarInRoomsService', () => {
  let service: AvatarInRoomsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvatarInRoomsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
