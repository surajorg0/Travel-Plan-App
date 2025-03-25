import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TourManagementPage } from './tour-management.page';

describe('TourManagementPage', () => {
  let component: TourManagementPage;
  let fixture: ComponentFixture<TourManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TourManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
