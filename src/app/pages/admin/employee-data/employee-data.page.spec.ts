import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeDataPage } from './employee-data.page';

describe('EmployeeDataPage', () => {
  let component: EmployeeDataPage;
  let fixture: ComponentFixture<EmployeeDataPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
