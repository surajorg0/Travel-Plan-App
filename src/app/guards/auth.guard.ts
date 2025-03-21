import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const isAuthenticated = await authService.isAuthenticated();
    
    if (isAuthenticated) {
      return true;
    } else {
      // Redirect to login page if not authenticated
      router.navigateByUrl('/auth/login');
      return false;
    }
  } catch (error) {
    console.error('Auth guard error:', error);
    router.navigateByUrl('/auth/login');
    return false;
  }
}; 