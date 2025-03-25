import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoodBoardPage } from './mood-board.page';

describe('MoodBoardPage', () => {
  let component: MoodBoardPage;
  let fixture: ComponentFixture<MoodBoardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MoodBoardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
