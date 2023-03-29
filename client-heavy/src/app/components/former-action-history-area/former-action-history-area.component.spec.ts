import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormerActionHistoryAreaComponent } from './former-action-history-area.component';

describe('FormerActionHistoryAreaComponent', () => {
  let component: FormerActionHistoryAreaComponent;
  let fixture: ComponentFixture<FormerActionHistoryAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormerActionHistoryAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormerActionHistoryAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
