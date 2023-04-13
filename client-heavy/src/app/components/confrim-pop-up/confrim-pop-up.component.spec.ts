import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfrimPopUpComponent } from './confrim-pop-up.component';

describe('ConfrimPopUpComponent', () => {
  let component: ConfrimPopUpComponent;
  let fixture: ComponentFixture<ConfrimPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfrimPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfrimPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
