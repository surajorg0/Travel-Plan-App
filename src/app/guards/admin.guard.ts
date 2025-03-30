import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // First check if the user is authenticated
    const isAuthenticated = await this.authService.isAuthenticated();
    
    if (!isAuthenticated) {
      // If not authenticated, redirect to login page
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    // Then check if the user is an admin
    const isAdmin = await this.authService.isAdmin();
    
    if (isAdmin) {
      return true;
    }
    
    // If not admin but authenticated, redirect to employee dashboard
    this.router.navigate(['/pages/employee-dashboard']);
    return false;
  }
} 