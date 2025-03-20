import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamInsightsPage } from './team-insights.page';

describe('TeamInsightsPage', () => {
  let component: TeamInsightsPage;
  let fixture: ComponentFixture<TeamInsightsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamInsightsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
