import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  async canActivate(): Promise<boolean> {
    const isAdmin = await this.authService.isAdmin();
    
    if (isAdmin) {
      return true;
    }
    
    // If not admin, redirect to employee dashboard if authenticated, 
    // or login page if not authenticated
    const isAuthenticated = await this.authService.isAuthenticated();
    if (isAuthenticated) {
      this.router.navigate(['/pages/employee-dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
    
    return false;
  }
} 