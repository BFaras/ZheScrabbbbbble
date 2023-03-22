import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpAvatarPopUpComponent } from './sign-up-avatar-pop-up.component';

describe('SignUpAvatarPopUpComponent', () => {
  let component: SignUpAvatarPopUpComponent;
  let fixture: ComponentFixture<SignUpAvatarPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignUpAvatarPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpAvatarPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
