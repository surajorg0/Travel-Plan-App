import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StayBackRequestPage } from './stay-back-request.page';

describe('StayBackRequestPage', () => {
  let component: StayBackRequestPage;
  let fixture: ComponentFixture<StayBackRequestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StayBackRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
