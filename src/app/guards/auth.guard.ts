import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  async canActivate(): Promise<boolean> {
    const isAuthenticated = await this.authService.isAuthenticated();
    
    if (isAuthenticated) {
      return true;
    }
    
    // If not authenticated, redirect to login page
    this.router.navigate(['/auth/login']);
    return false;
  }
} 