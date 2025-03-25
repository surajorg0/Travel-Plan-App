import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { EmployeeGuard } from './guards/employee.guard';

const routes: Routes = [
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
    path: 'pages/admin-dashboard',
    loadChildren: () => import('./pages/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/employee-dashboard',
    loadChildren: () => import('./pages/employee-dashboard/employee-dashboard.module').then(m => m.EmployeeDashboardPageModule),
    canActivate: [AuthGuard, EmployeeGuard]
  },
  {
    path: 'pages/admin/mood-board',
    loadChildren: () => import('./pages/admin/mood-board/mood-board.module').then(m => m.MoodBoardPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'pages/employee/mood-board',
    loadChildren: () => import('./pages/employee/mood-board/mood-board.module').then(m => m.MoodBoardPageModule),
    canActivate: [AuthGuard, EmployeeGuard]
  },
  // Add any other routes your app needs
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { } 