import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordLostPageComponent } from './password-lost-page.component';

describe('PasswordLostPageComponent', () => {
  let component: PasswordLostPageComponent;
  let fixture: ComponentFixture<PasswordLostPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordLostPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordLostPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
