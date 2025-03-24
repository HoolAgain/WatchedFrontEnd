import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatemovieComponent } from './ratemovie.component';

describe('RatemovieComponent', () => {
  let component: RatemovieComponent;
  let fixture: ComponentFixture<RatemovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RatemovieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatemovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
