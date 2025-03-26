import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { BiometricService } from './biometric.service';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  profilePic?: string;
  interests?: string[];
  birthDate?: string;
  useFingerprintLogin?: boolean;
  // Additional profile properties
  phoneNumber?: string;
  location?: string;
  jobTitle?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  
  // Auth state to broadcast login/logout status
  private _authState = new BehaviorSubject<boolean>(false);
  public authState$ = this._authState.asObservable();
  
  private readonly BIOMETRIC_SERVER = 'traveler.app.auth';
  private initialized = false;
  private apiUrl: string;

  constructor(
    private storageService: StorageService,
    private router: Router,
    private biometricService: BiometricService,
    private http: HttpClient
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.initAuth();
    this.apiUrl = 'http://localhost:3000'; // Assuming a default API URL
  }

  public async initAuth() {
    if (this.initialized) return;
    
    try {
      // Check if there's a stored user
      const storedUser = await this.storageService.get('currentUser');
      
      if (storedUser) {
        this.currentUserSubject.next(storedUser);
        this._authState.next(true);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing auth service:', error);
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      // In a real app, this would make an API call to validate credentials
      const users = await this.getUsers();
      
      // Simulate login validation with user-specific passwords
      const user = users.find(u => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          // Check specific passwords for each user
          if (u.email.toLowerCase() === 'suraj@gmail.com' && password === '123456') {
            return true;
          } else if (u.email === '8180012573' && password === '123456') {
            return true;
          } else if (u.email.toLowerCase() === 's@gmail.com' && password === '123456') {
            return true;
          } else if (u.email.toLowerCase() === 'admin@gmail.com' && password === 'password') {
            return true;
          }
        }
        return false;
      });
      
      if (user) {
        // Store user in storage
        await this.storageService.set('currentUser', user);
        this.currentUserSubject.next(user);
        
        // Update auth state
        this._authState.next(true);
        
        // Navigate to appropriate dashboard
        if (user.role === 'admin') {
          this.router.navigate(['/pages/admin-dashboard']);
        } else {
          this.router.navigate(['/pages/employee-dashboard']);
        }
        
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear the current user from storage
      await this.storageService.remove('currentUser');
      
      // Update subjects
      this.currentUserSubject.next(null);
      this._authState.next(false);
      
      // Navigate to login
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    // Ensure auth is initialized
    if (!this.initialized) {
      await this.initAuth();
    }
    
    return !!this.currentUserValue;
  }

  async isAdmin(): Promise<boolean> {
    const user = this.currentUserValue;
    return !!user && user.role === 'admin';
  }

  async isEmployee(): Promise<boolean> {
    const user = this.currentUserValue;
    return !!user && user.role === 'employee';
  }

  async loginWithFingerprint(): Promise<User | null> {
    try {
      // Check if fingerprint login is enabled
      const fingerprintUser = await this.storageService.get('fingerprintUser');
      if (!fingerprintUser) {
        console.error('No fingerprint login enabled');
        return null;
      }
      
      // Get credentials
      const credentials = await this.biometricService.getCredentials(this.BIOMETRIC_SERVER);
      if (!credentials || !credentials.username) {
        console.error('Failed to retrieve biometric credentials');
        return null;
      }
      
      console.log('Retrieved biometric credentials for:', credentials.username);
      
      // Find the user from our mock data or API
      // In a real app, you would validate with your backend using a token
      const users = await this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === credentials.username.toLowerCase());
      
      if (user) {
        // Update user in storage
        await this.storeUser(user);
        
        // Emit authentication state change
        this._authState.next(true);
        
        console.log('Logged in successfully with fingerprint as:', user.name);
        
        // Navigate to the appropriate dashboard based on user role
        if (user.role === 'admin') {
          this.router.navigate(['/pages/admin-dashboard']);
        } else {
          this.router.navigate(['/pages/employee-dashboard']);
        }
        
        return user;
      } else {
        console.error('User not found for fingerprint login');
        return null;
      }
    } catch (error) {
      console.error('Error during fingerprint login:', error);
      return null;
    }
  }

  async enableFingerprintLogin(user: User): Promise<boolean> {
    try {
      if (!user || !user.email) {
        console.error('Cannot enable fingerprint login: Invalid user');
        return false;
      }

      // Store the user's credentials securely
      const success = await this.biometricService.storeCredentials(
        user.email,
        'biometric_auth_token', // We don't actually store the real password for security
        this.BIOMETRIC_SERVER
      );

      if (success) {
        // Store which user has fingerprint enabled
        await this.storageService.set('fingerprintUser', user.email);
        
        // Update user's fingerprint preference if needed
        if (!user.useFingerprintLogin) {
          user.useFingerprintLogin = true;
          await this.updateUserPreferences(user);
        }
        
        console.log('Fingerprint login enabled for user:', user.email);
        return true;
      } else {
        console.error('Failed to store biometric credentials');
        return false;
      }
    } catch (error) {
      console.error('Error enabling fingerprint login:', error);
      return false;
    }
  }

  async disableFingerprintLogin(): Promise<boolean> {
    try {
      // Get current fingerprint user
      const fingerprintUser = await this.storageService.get('fingerprintUser');
      if (!fingerprintUser) {
        console.log('No fingerprint login was enabled');
        return true;
      }
      
      // Delete biometric credentials
      await this.biometricService.deleteCredentials(this.BIOMETRIC_SERVER);
      
      // Remove fingerprint user from storage
      await this.storageService.remove('fingerprintUser');
      
      // Update user preferences if the current user is logged in
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.email === fingerprintUser) {
        currentUser.useFingerprintLogin = false;
        await this.updateUserPreferences(currentUser);
      }
      
      console.log('Fingerprint login disabled');
      return true;
    } catch (error) {
      console.error('Error disabling fingerprint login:', error);
      return false;
    }
  }
  
  async isFingerprintEnabled(): Promise<boolean> {
    try {
      // Check if we have any stored fingerprint credentials
      const fingerprintUser = await this.storageService.get('fingerprintUser');
      return !!fingerprintUser;
    } catch (error) {
      console.error('Error checking fingerprint status:', error);
      return false;
    }
  }

  // Get users (in a real app this would be from an API)
  private async getUsers(): Promise<User[]> {
    const defaultUsers: User[] = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@gmail.com',
        role: 'admin',
        profilePic: 'assets/icon/admin-avatar.png'
      },
      {
        id: '2',
        name: 'Suraj',
        email: 'suraj@gmail.com',
        role: 'employee',
        profilePic: 'assets/icon/employee-avatar.png',
        useFingerprintLogin: false
      },
      {
        id: '3',
        name: 'Mobile User',
        email: '8180012573',
        role: 'employee',
        profilePic: 'assets/icon/employee-avatar.png',
        useFingerprintLogin: false
      },
      {
        id: '4',
        name: 'S User',
        email: 's@gmail.com',
        role: 'employee',
        profilePic: 'assets/icon/employee-avatar.png',
        useFingerprintLogin: false
      }
    ];
    
    try {
      // Try to get users from storage
      const users = await this.storageService.get('users');
      return users || defaultUsers;
    } catch (error) {
      console.error('Error getting users:', error);
    }
    
    return defaultUsers;
  }

  private async updateUserPreferences(user: User): Promise<void> {
    try {
      if (!user || !user.email) return;
      
      // Get all users
      const users = await this.getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex >= 0) {
        // Update the user in the array
        users[userIndex] = {...users[userIndex], ...user};
        
        // Save the updated users array
        await this.storageService.set('users', users);
      }
      
      // Also update current user if it's the same user
      if (this.currentUserValue && this.currentUserValue.id === user.id) {
        await this.storeUser(user);
      }
      
      console.log('Updated user preferences for:', user.email);
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  private async storeUser(user: User): Promise<void> {
    await this.storageService.set('currentUser', user);
    this.currentUserSubject.next(user);
  }

  private findUserByEmail(email: string): User | undefined {
    // This is just a helper to be used with getUsers() in a real implementation
    return this.currentUserValue && this.currentUserValue.email === email ? 
      this.currentUserValue : undefined;
  }

  private getCurrentUser(): User | null {
    return this.currentUserValue;
  }

  register(userData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}/api/users/register`, userData).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error) => {
          reject(error.error || error);
        }
      );
    });
  }

  getPendingUsers(): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = this.getAuthHeaders();
      this.http.get(`${this.apiUrl}/api/users/pending`, { headers }).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error) => {
          reject(error.error || error);
        }
      );
    });
  }

  approveUser(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = this.getAuthHeaders();
      this.http.put(`${this.apiUrl}/api/users/${userId}/approve`, {}, { headers }).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error) => {
          reject(error.error || error);
        }
      );
    });
  }

  toggleUserStatus(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = this.getAuthHeaders();
      this.http.put(`${this.apiUrl}/api/users/${userId}/toggle-status`, {}, { headers }).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error) => {
          reject(error.error || error);
        }
      );
    });
  }

  private getAuthHeaders() {
    const token = this.storageService.get('token');
    return {
      Authorization: `Bearer ${token}`
    };
  }
}
