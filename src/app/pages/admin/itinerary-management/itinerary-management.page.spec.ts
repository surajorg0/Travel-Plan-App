import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItineraryManagementPage } from './itinerary-management.page';

describe('ItineraryManagementPage', () => {
  let component: ItineraryManagementPage;
  let fixture: ComponentFixture<ItineraryManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
