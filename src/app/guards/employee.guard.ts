import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // First check if user is authenticated
      const isAuthenticated = await this.authService.isAuthenticated();
      
      if (!isAuthenticated) {
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      // Then check if user is an employee
      const isEmployee = await this.authService.isEmployee();
      
      if (isEmployee) {
        return true;
      }
      
      // If not employee but authenticated, check if admin
      const isAdmin = await this.authService.isAdmin();
      if (isAdmin) {
        this.router.navigate(['/pages/admin-dashboard']);
      } else {
        // Fallback to login if neither employee nor admin (shouldn't happen)
        this.router.navigate(['/auth/login']);
      }
      
      return false;
    } catch (error) {
      console.error('Error in EmployeeGuard:', error);
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
} 