import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeNamePopUpComponent } from './change-name-pop-up.component';

describe('ChangeNamePopUpComponent', () => {
  let component: ChangeNamePopUpComponent;
  let fixture: ComponentFixture<ChangeNamePopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeNamePopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeNamePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
