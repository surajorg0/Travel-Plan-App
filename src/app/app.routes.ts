import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { EmployeeGuard } from './guards/employee.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'pages/employee-dashboard',
    loadComponent: () => import('./pages/employee-dashboard/employee-dashboard.page').then(m => m.EmployeeDashboardPage),
    canActivate: [AuthGuard, EmployeeGuard]
  },
  {
    path: 'pages/admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.page').then(m => m.AdminDashboardPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'pages/settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'pages/employee/document-submission',
    loadComponent: () => import('./pages/employee/document-submission/document-submission.page').then( m => m.DocumentSubmissionPage)
  },
  {
    path: 'pages/employee/photo-sharing',
    loadComponent: () => import('./pages/employee/photo-sharing/photo-sharing.page').then( m => m.PhotoSharingPage)
  },
  {
    path: 'pages/employee/team-insights',
    loadComponent: () => import('./pages/employee/team-insights/team-insights.page').then( m => m.TeamInsightsPage)
  },
  {
    path: 'pages/employee/stay-back-request',
    loadComponent: () => import('./pages/employee/stay-back-request/stay-back-request.page').then( m => m.StayBackRequestPage)
  },
  {
    path: 'pages/employee/support-ticket',
    loadComponent: () => import('./pages/employee/support-ticket/support-ticket.page').then( m => m.SupportTicketPage)
  },
  {
    path: 'pages/employee/mood-board',
    loadComponent: () => import('./pages/employee/mood-board/mood-board.page').then(m => m.MoodBoardPage),
    canActivate: [AuthGuard, EmployeeGuard]
  },
  {
    path: 'pages/employee/travel-game',
    loadComponent: () => import('./pages/employee/travel-game/travel-game.page').then(m => m.TravelGamePage),
    canActivate: [AuthGuard, EmployeeGuard]
  },
  {
    path: 'pages/admin/tour-management',
    loadComponent: () => import('./pages/admin/tour-management/tour-management.page').then( m => m.TourManagementPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/admin/document-management',
    loadComponent: () => import('./pages/admin/document-management/document-management.page').then( m => m.DocumentManagementPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/admin/approval-workflow',
    loadComponent: () => import('./pages/admin/approval-workflow/approval-workflow.page').then( m => m.ApprovalWorkflowPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/admin/ticket-management',
    loadComponent: () => import('./pages/admin/ticket-management/ticket-management.page').then( m => m.TicketManagementPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/admin/content-sharing',
    loadComponent: () => import('./pages/admin/content-sharing/content-sharing.page').then( m => m.ContentSharingPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/admin/employee-data',
    loadComponent: () => import('./pages/admin/employee-data/employee-data.page').then( m => m.EmployeeDataPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/admin/itinerary-management',
    loadComponent: () => import('./pages/admin/itinerary-management/itinerary-management.page').then( m => m.ItineraryManagementPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/admin/mood-board',
    loadComponent: () => import('./pages/admin/mood-board/mood-board.page').then(m => m.MoodBoardPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/admin/user-approval',
    loadComponent: () => import('./pages/admin/user-approval/user-approval.page').then(m => m.UserApprovalPage),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
