import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportTicketPage } from './support-ticket.page';

describe('SupportTicketPage', () => {
  let component: SupportTicketPage;
  let fixture: ComponentFixture<SupportTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
