import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApprovalWorkflowPage } from './approval-workflow.page';

describe('ApprovalWorkflowPage', () => {
  let component: ApprovalWorkflowPage;
  let fixture: ComponentFixture<ApprovalWorkflowPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalWorkflowPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
