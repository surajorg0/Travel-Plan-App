import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  profilePic?: string;
  interests?: string[];
  birthDate?: string;
  useFingerprintLogin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private initialized = false;

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {
    this.initAuth();
  }

  async initAuth() {
    if (this.initialized) return;
    
    try {
      const storedUser = await this.storageService.get('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(storedUser);
        
        // Auto-navigate based on stored user role
        setTimeout(() => {
          if (storedUser.role === 'admin') {
            this.router.navigate(['/pages/admin-dashboard']);
          } else {
            this.router.navigate(['/pages/employee-dashboard']);
          }
        }, 0);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
    
    this.initialized = true;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<User | null> {
    // Mock login - in a real app, this would call an API
    const users = await this.getUsers();
    const user = users.find(u => u.email === email && password === 'password'); // Simple mock password
    
    if (user) {
      await this.storageService.set('currentUser', user);
      this.currentUserSubject.next(user);
      
      // Navigate based on role
      if (user.role === 'admin') {
        this.router.navigate(['/pages/admin-dashboard']);
      } else {
        this.router.navigate(['/pages/employee-dashboard']);
      }
      return user;
    }
    
    return null;
  }

  async loginWithFingerprint(): Promise<User | null> {
    try {
      // Get previously stored user with fingerprint enabled
      const users = await this.getUsers();
      const storedFingerprint = await this.storageService.get('fingerprintUser');
      
      if (!storedFingerprint) return null;
      
      const user = users.find(u => u.email === storedFingerprint);
      
      if (user && user.role === 'employee') {
        await this.storageService.set('currentUser', user);
        this.currentUserSubject.next(user);
        this.router.navigate(['/pages/employee-dashboard']);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error during fingerprint login:', error);
      return null;
    }
  }

  async enableFingerprintLogin(user: User): Promise<boolean> {
    try {
      if (user.role === 'admin') return false; // Don't allow for admins
      
      // Update user settings
      const users = await this.getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex >= 0) {
        users[userIndex].useFingerprintLogin = true;
        await this.storageService.set('users', users);
        await this.storageService.set('fingerprintUser', user.email);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error enabling fingerprint login:', error);
      return false;
    }
  }

  async disableFingerprintLogin(): Promise<void> {
    try {
      await this.storageService.remove('fingerprintUser');
      
      // Update user setting
      const currentUser = this.currentUserValue;
      if (currentUser) {
        const users = await this.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex >= 0) {
          users[userIndex].useFingerprintLogin = false;
          await this.storageService.set('users', users);
        }
      }
    } catch (error) {
      console.error('Error disabling fingerprint login:', error);
    }
  }
  
  async isFingerprintEnabled(): Promise<boolean> {
    try {
      const fingerprintUser = await this.storageService.get('fingerprintUser');
      return !!fingerprintUser;
    } catch (error) {
      console.error('Error checking fingerprint status:', error);
      return false;
    }
  }

  async logout() {
    await this.storageService.remove('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  async register(user: Partial<User>): Promise<User | null> {
    // Mock registration
    const users = await this.getUsers();
    const newUser: User = {
      id: users.length + 1,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'employee',
      interests: user.interests || [],
      birthDate: user.birthDate,
      profilePic: user.profilePic,
      useFingerprintLogin: false
    };
    
    users.push(newUser);
    await this.storageService.set('users', users);
    return newUser;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.storageService.get('currentUser');
    return !!user;
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.storageService.get('currentUser');
    return user && user.role === 'admin';
  }

  async getUsers(): Promise<User[]> {
    const users = await this.storageService.get('users');
    return users || this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers(): Promise<User[]> {
    const defaultUsers: User[] = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@gmail.com',
        role: 'admin',
        birthDate: '1990-01-01',
        useFingerprintLogin: false
      },
      {
        id: 2,
        name: 'Suraj',
        email: 'suraj@gmail.com',
        role: 'employee',
        interests: ['Casinos', 'Beach Resorts'],
        birthDate: '1992-03-15',
        useFingerprintLogin: false
      },
      {
        id: 3,
        name: 'User2',
        email: '8180012573@gmail.com',
        role: 'employee',
        interests: ['Mountains', 'Historical Sites'],
        birthDate: '1995-05-10',
        useFingerprintLogin: false
      }
    ];
    
    await this.storageService.set('users', defaultUsers);
    return defaultUsers;
  }
}
