import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  async canActivate(): Promise<boolean> {
    const isEmployee = await this.authService.isEmployee();
    
    if (isEmployee) {
      return true;
    }
    
    // If not employee, redirect to admin dashboard if authenticated as admin, 
    // or login page if not authenticated
    const isAdmin = await this.authService.isAdmin();
    if (isAdmin) {
      this.router.navigate(['/pages/admin-dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
    
    return false;
  }
} 