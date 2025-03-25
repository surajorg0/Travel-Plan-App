import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketManagementPage } from './ticket-management.page';

describe('TicketManagementPage', () => {
  let component: TicketManagementPage;
  let fixture: ComponentFixture<TicketManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
