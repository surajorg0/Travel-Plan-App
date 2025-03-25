import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentSubmissionPage } from './document-submission.page';

describe('DocumentSubmissionPage', () => {
  let component: DocumentSubmissionPage;
  let fixture: ComponentFixture<DocumentSubmissionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentSubmissionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
