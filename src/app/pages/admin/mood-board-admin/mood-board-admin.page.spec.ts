import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoodBoardAdminPage } from './mood-board-admin.page';

describe('MoodBoardAdminPage', () => {
  let component: MoodBoardAdminPage;
  let fixture: ComponentFixture<MoodBoardAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MoodBoardAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
