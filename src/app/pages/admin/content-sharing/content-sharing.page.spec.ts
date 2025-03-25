import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentSharingPage } from './content-sharing.page';

describe('ContentSharingPage', () => {
  let component: ContentSharingPage;
  let fixture: ComponentFixture<ContentSharingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSharingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
