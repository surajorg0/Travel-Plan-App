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
      console.log('Initializing auth service...');
      
      // Wait for storage to be ready
      await this.storageService.init();
      
      // Get current user
      const storedUser = await this.storageService.get('currentUser');
      console.log('Retrieved stored user:', storedUser ? storedUser.email : 'None');
      
      if (storedUser) {
        this.currentUserSubject.next(storedUser);
        
        // Auto-navigate based on stored user role
        setTimeout(() => {
          if (storedUser.role === 'admin') {
            console.log('Auto-navigating to admin dashboard');
            this.router.navigate(['/pages/admin-dashboard']);
          } else {
            console.log('Auto-navigating to employee dashboard');
            this.router.navigate(['/pages/employee-dashboard']);
          }
        }, 500);
        
        // Force refresh user data from storage to ensure we have the latest
        this.getUsers().then(users => {
          const refreshedUser = users.find(u => u.id === storedUser.id);
          if (refreshedUser) {
            this.currentUserSubject.next(refreshedUser);
            this.storageService.set('currentUser', refreshedUser);
          }
        });
      } else {
        console.log('No stored user found');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Try to recover by re-initializing users
      try {
        await this.initializeDefaultUsers();
      } catch (e) {
        console.error('Error recovering from auth initialization failure:', e);
      }
    } finally {
      this.initialized = true;
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      console.log('Login attempt for:', email);
      const users = await this.getUsers();
      console.log('Available users:', users.map(u => u.email));
      
      // Normalize email for comparison
      const normalizedEmail = email.toLowerCase().trim();
      const correctPassword = 'password'; // Fixed password for testing
      
      // Direct check for our three primary users first
      if (normalizedEmail === 'admin@gmail.com' && password === correctPassword) {
        console.log('Admin login attempt with correct credentials');
        const adminUser = users.find(u => u.email.toLowerCase() === 'admin@gmail.com');
        if (adminUser) {
          console.log('Admin user found, proceeding with login');
          await this.storeAndNavigateUser(adminUser);
          return adminUser;
        }
      }
      
      if (normalizedEmail === 'suraj@gmail.com' && password === correctPassword) {
        console.log('Suraj login attempt with correct credentials');
        const surajUser = users.find(u => u.email.toLowerCase() === 'suraj@gmail.com');
        if (surajUser) {
          console.log('Suraj user found, proceeding with login');
          await this.storeAndNavigateUser(surajUser);
          return surajUser;
        }
      }
      
      if (normalizedEmail === '8180012573@gmail.com' && password === correctPassword) {
        console.log('User2 login attempt with correct credentials');
        const user2 = users.find(u => u.email.toLowerCase() === '8180012573@gmail.com');
        if (user2) {
          console.log('User2 found, proceeding with login');
          await this.storeAndNavigateUser(user2);
          return user2;
        }
      }
      
      // If none of the specific checks worked, try general matching
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail && password === correctPassword);
      if (user) {
        console.log('Login successful for user:', user.email, user.role);
        await this.storeAndNavigateUser(user);
        return user;
      }
      
      console.log('Login failed - no matching user found for:', email);
      return null;
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  }
  
  // Helper method to avoid code duplication
  private async storeAndNavigateUser(user: User) {
    await this.storageService.set('currentUser', user);
    this.currentUserSubject.next(user);
    
    // Navigate based on role
    if (user.role === 'admin') {
      this.router.navigate(['/pages/admin-dashboard']);
    } else {
      this.router.navigate(['/pages/employee-dashboard']);
    }
  }

  async loginWithFingerprint(): Promise<User | null> {
    try {
      console.log('Attempting login with fingerprint...');
      
      // Get previously stored user with fingerprint enabled
      const users = await this.getUsers();
      console.log('Available users for fingerprint login:', users.map(u => u.email));
      
      const storedFingerprint = await this.storageService.get('fingerprintUser');
      console.log('Stored fingerprint user email:', storedFingerprint);
      
      if (!storedFingerprint) {
        console.log('No fingerprint user stored in preferences');
        return null;
      }
      
      // Find the user with matching email
      const user = users.find(u => u.email.toLowerCase() === storedFingerprint.toLowerCase());
      console.log('Found fingerprint user:', user?.email);
      
      if (user) {
        // Store the current user and update the subject
        await this.storageService.set('currentUser', user);
        this.currentUserSubject.next(user);
        
        // Navigate based on role (should be employee as admins can't use fingerprint)
        if (user.role === 'employee') {
          console.log('Navigating to employee dashboard after fingerprint login');
          this.router.navigate(['/pages/employee-dashboard']);
          return user;
        } else {
          console.log('Warning: Admin user attempted fingerprint login which is not allowed');
          return null;
        }
      } else {
        console.log('No matching user found for stored fingerprint email:', storedFingerprint);
      }
      
      return null;
    } catch (error) {
      console.error('Error during fingerprint login:', error);
      return null;
    }
  }

  async enableFingerprintLogin(user: User): Promise<boolean> {
    try {
      console.log('Enabling fingerprint login for user:', user.email);
      
      if (user.role === 'admin') {
        console.log('Cannot enable fingerprint for admin users');
        return false; // Don't allow for admins
      }
      
      // Update user settings
      const users = await this.getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex >= 0) {
        console.log('Found user in users array, updating fingerprint setting');
        users[userIndex].useFingerprintLogin = true;
        
        // Save the updated users array
        await this.storageService.set('users', users);
        
        // Store the email as the fingerprint user
        await this.storageService.set('fingerprintUser', user.email);
        
        console.log('Fingerprint login enabled successfully for:', user.email);
        return true;
      } else {
        console.log('User not found in users array:', user.email);
      }
      
      return false;
    } catch (error) {
      console.error('Error enabling fingerprint login:', error);
      return false;
    }
  }

  async disableFingerprintLogin(): Promise<void> {
    try {
      const fingerprintUser = await this.storageService.get('fingerprintUser');
      console.log('Disabling fingerprint login for user:', fingerprintUser);
      
      await this.storageService.remove('fingerprintUser');
      
      // Update user setting
      const currentUser = this.currentUserValue;
      if (currentUser) {
        const users = await this.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex >= 0) {
          users[userIndex].useFingerprintLogin = false;
          await this.storageService.set('users', users);
          console.log('Fingerprint setting updated in user object');
        }
      }
      
      console.log('Fingerprint login disabled successfully');
    } catch (error) {
      console.error('Error disabling fingerprint login:', error);
    }
  }
  
  async isFingerprintEnabled(): Promise<boolean> {
    try {
      const fingerprintUser = await this.storageService.get('fingerprintUser');
      console.log('Checking if fingerprint is enabled. Stored fingerprint user:', fingerprintUser);
      
      if (!fingerprintUser) {
        return false;
      }
      
      // Verify the user still exists in our users array
      const users = await this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === fingerprintUser.toLowerCase());
      
      if (!user) {
        console.log('Stored fingerprint user no longer exists in users array');
        await this.storageService.remove('fingerprintUser');
        return false;
      }
      
      return true;
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
    console.log('Initializing default users');
    
    // First check if users already exist to prevent overwriting
    const existingUsers = await this.storageService.get('users');
    if (existingUsers && Array.isArray(existingUsers) && existingUsers.length > 0) {
      // Make sure all required users exist
      let hasAdmin = false;
      let hasSuraj = false;
      let hasSecondUser = false;
      
      for (const user of existingUsers) {
        if (user.email.toLowerCase() === 'admin@gmail.com') hasAdmin = true;
        if (user.email.toLowerCase() === 'suraj@gmail.com') hasSuraj = true;
        if (user.email.toLowerCase() === '8180012573@gmail.com') hasSecondUser = true;
      }
      
      const usersToAdd = [];
      
      // Add any missing required users
      if (!hasAdmin) {
        usersToAdd.push({
          id: existingUsers.length + usersToAdd.length + 1,
          name: 'Admin User',
          email: 'admin@gmail.com',
          role: 'admin',
          birthDate: '1990-01-01',
          useFingerprintLogin: false
        });
      }
      
      if (!hasSuraj) {
        usersToAdd.push({
          id: existingUsers.length + usersToAdd.length + 1,
          name: 'Suraj',
          email: 'suraj@gmail.com',
          role: 'employee',
          interests: ['Casinos', 'Beach Resorts'],
          birthDate: '1992-03-15',
          useFingerprintLogin: false
        });
      }
      
      if (!hasSecondUser) {
        usersToAdd.push({
          id: existingUsers.length + usersToAdd.length + 1,
          name: 'User2',
          email: '8180012573@gmail.com',
          role: 'employee',
          interests: ['Mountains', 'Historical Sites'],
          birthDate: '1995-05-10',
          useFingerprintLogin: false
        });
      }
      
      // If any required users were missing, add them and update storage
      if (usersToAdd.length > 0) {
        const updatedUsers = [...existingUsers, ...usersToAdd];
        await this.storageService.set('users', updatedUsers);
        console.log('Updated users with missing required accounts:', usersToAdd.map(u => u.email));
        return updatedUsers;
      }
      
      return existingUsers;
    }
    
    // If no users exist, create the default set
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
    
    console.log('Setting default users:', defaultUsers.map(u => u.email));
    await this.storageService.set('users', defaultUsers);
    return defaultUsers;
  }
}
