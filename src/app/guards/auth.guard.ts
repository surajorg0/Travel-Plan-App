import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const isAuthenticated = await this.authService.isAuthenticated();
      
      if (isAuthenticated) {
        return true;
      }
      
      // If not authenticated, redirect to login page
      this.router.navigate(['/auth/login']);
      return false;
    } catch (error) {
      console.error('Error in AuthGuard:', error);
      // In case of any error, redirect to login page for safety
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
} 