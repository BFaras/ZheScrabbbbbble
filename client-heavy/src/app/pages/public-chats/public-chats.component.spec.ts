import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicChatsComponent } from './public-chats.component';

describe('PublicChatsComponent', () => {
  let component: PublicChatsComponent;
  let fixture: ComponentFixture<PublicChatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicChatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
