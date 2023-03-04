import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordLostAreaComponent } from './password-lost-area.component';

describe('PasswordLostAreaComponent', () => {
  let component: PasswordLostAreaComponent;
  let fixture: ComponentFixture<PasswordLostAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordLostAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordLostAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
