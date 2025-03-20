import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'pages/employee-dashboard',
    loadComponent: () => import('./pages/employee-dashboard/employee-dashboard.page').then( m => m.EmployeeDashboardPage)
  },
  {
    path: 'pages/admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.page').then( m => m.AdminDashboardPage)
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
    loadComponent: () => import('./pages/employee/mood-board/mood-board.page').then( m => m.MoodBoardPage)
  },
  {
    path: 'pages/admin/tour-management',
    loadComponent: () => import('./pages/admin/tour-management/tour-management.page').then( m => m.TourManagementPage)
  },
  {
    path: 'pages/admin/document-management',
    loadComponent: () => import('./pages/admin/document-management/document-management.page').then( m => m.DocumentManagementPage)
  },
  {
    path: 'pages/admin/approval-workflow',
    loadComponent: () => import('./pages/admin/approval-workflow/approval-workflow.page').then( m => m.ApprovalWorkflowPage)
  },
  {
    path: 'pages/admin/ticket-management',
    loadComponent: () => import('./pages/admin/ticket-management/ticket-management.page').then( m => m.TicketManagementPage)
  },
  {
    path: 'pages/admin/content-sharing',
    loadComponent: () => import('./pages/admin/content-sharing/content-sharing.page').then( m => m.ContentSharingPage)
  },
  {
    path: 'pages/admin/employee-data',
    loadComponent: () => import('./pages/admin/employee-data/employee-data.page').then( m => m.EmployeeDataPage)
  },
  {
    path: 'pages/admin/itinerary-management',
    loadComponent: () => import('./pages/admin/itinerary-management/itinerary-management.page').then( m => m.ItineraryManagementPage)
  },
  {
    path: 'pages/admin/mood-board-admin',
    loadComponent: () => import('./pages/admin/mood-board-admin/mood-board-admin.page').then( m => m.MoodBoardAdminPage)
  }
];
