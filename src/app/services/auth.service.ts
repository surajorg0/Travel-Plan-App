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
    
    const storedUser = await this.storageService.get('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
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
      profilePic: user.profilePic
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
        birthDate: '1990-01-01'
      },
      {
        id: 2,
        name: 'Suraj',
        email: 'suraj@gmail.com',
        role: 'employee',
        interests: ['Casinos', 'Beach Resorts'],
        birthDate: '1992-03-15'
      },
      {
        id: 3,
        name: 'Jane Employee',
        email: 'jane@example.com',
        role: 'employee',
        interests: ['Cruise Tours', 'Mountains'],
        birthDate: '1988-07-22'
      }
    ];
    
    await this.storageService.set('users', defaultUsers);
    return defaultUsers;
  }
}
