import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlankTilePopUpComponent } from './blank-tile-pop-up.component';

describe('BlankTilePopUpComponent', () => {
  let component: BlankTilePopUpComponent;
  let fixture: ComponentFixture<BlankTilePopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlankTilePopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlankTilePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
