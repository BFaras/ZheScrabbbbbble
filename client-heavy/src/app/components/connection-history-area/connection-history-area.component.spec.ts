import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionHistoryAreaComponent } from './connection-history-area.component';

describe('ConnectionHistoryAreaComponent', () => {
  let component: ConnectionHistoryAreaComponent;
  let fixture: ComponentFixture<ConnectionHistoryAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectionHistoryAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionHistoryAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
