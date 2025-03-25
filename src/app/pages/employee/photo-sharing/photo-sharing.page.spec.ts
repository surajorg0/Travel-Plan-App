import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoSharingPage } from './photo-sharing.page';

describe('PhotoSharingPage', () => {
  let component: PhotoSharingPage;
  let fixture: ComponentFixture<PhotoSharingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoSharingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
