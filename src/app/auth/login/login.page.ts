import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  AlertController,
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonContent, 
  IonHeader, 
  IonIcon, 
  IonInput, 
  IonItem, 
  IonLabel, 
  IonSpinner, 
  IonTitle, 
  IonToolbar,
  ToastController
} from '@ionic/angular/standalone';

import { AuthService } from 'src/app/services/auth.service';
import { BiometricService } from 'src/app/services/biometric.service';
import { addIcons } from 'ionicons';
import { airplaneOutline, eyeOutline, eyeOffOutline, fingerPrintOutline } from 'ionicons/icons';
import { User } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonSpinner,
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  isFingerprintAvailable = false;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private biometricService: BiometricService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ 
      airplaneOutline,
      fingerPrintOutline,
      eyeOutline,
      eyeOffOutline
    });
  }

  ngOnInit() {
    this.initForm();
    
    // First check stored authentication
    this.checkAuth();
    
    // Then attempt fingerprint after a delay
    // Use a longer delay to ensure proper initialization
    setTimeout(() => {
      console.log('Delayed fingerprint check starting...');
      this.checkBiometricAvailability();
    }, 2000);
  }

  async checkAuth() {
    console.log('Checking if user is already authenticated...');
    const isAuthenticated = await this.authService.isAuthenticated();
    console.log('User authentication status:', isAuthenticated);
    
    if (isAuthenticated) {
      const isAdmin = await this.authService.isAdmin();
      console.log('User is admin:', isAdmin);
      
      if (isAdmin) {
        this.router.navigate(['/pages/admin-dashboard']);
      } else {
        this.router.navigate(['/pages/employee-dashboard']);
      }
    }
  }

  async checkBiometricAvailability() {
    try {
      console.log('Starting biometric availability check');
      this.isFingerprintAvailable = await this.biometricService.isAvailable();
      console.log('Fingerprint available result:', this.isFingerprintAvailable);
      
      // If fingerprint is available and there's a registered user for fingerprint auth
      if (this.isFingerprintAvailable) {
        const fingerprintEnabled = await this.authService.isFingerprintEnabled();
        console.log('Fingerprint enabled for a user:', fingerprintEnabled);
        
        if (fingerprintEnabled) {
          console.log('Attempting fingerprint authentication...');
          // Show a toast to inform user
          const toast = await this.toastController.create({
            message: 'Fingerprint authentication available. Please scan your fingerprint.',
            duration: 3000,
            position: 'bottom',
            color: 'primary'
          });
          await toast.present();
          
          // Add slight delay before launching the fingerprint prompt
          setTimeout(() => {
            this.authenticateWithFingerprint();
          }, 1000);
        }
      } else {
        console.log('Fingerprint is not available on this device or not set up');
      }
    } catch (error) {
      console.error('Error during biometric availability check:', error);
      this.isFingerprintAvailable = false;
    }
  }

  async authenticateWithFingerprint() {
    try {
      console.log('Starting fingerprint authentication flow...');
      const authenticated = await this.biometricService.authenticate(
        'Travel Plan App', 
        'Login with your fingerprint'
      );
      
      console.log('Fingerprint authentication result:', authenticated);
      
      if (authenticated) {
        this.isLoading = true;
        
        // Display authentication in progress
        const loadingToast = await this.toastController.create({
          message: 'Fingerprint recognized, logging in...',
          duration: 2000,
          position: 'bottom',
          color: 'primary'
        });
        await loadingToast.present();
        
        // Attempt to login with fingerprint
        const user = await this.authService.loginWithFingerprint();
        console.log('Fingerprint login result:', user ? 'Success' : 'Failed');
        
        if (user) {
          // Show success toast
          const toast = await this.toastController.create({
            message: 'Login successful with fingerprint authentication',
            duration: 2000,
            position: 'bottom',
            color: 'success'
          });
          await toast.present();
        } else {
          // Login attempt failed despite fingerprint being recognized
          const toast = await this.toastController.create({
            message: 'Fingerprint recognized but user not found. Please login with credentials.',
            duration: 3000,
            position: 'bottom',
            color: 'warning'
          });
          await toast.present();
        }
      } else {
        console.log('Fingerprint authentication was not successful');
      }
    } catch (error) {
      console.error('Error during fingerprint authentication:', error);
      const toast = await this.toastController.create({
        message: 'Fingerprint authentication failed. Please use your credentials.',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  initForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get errorControl() {
    return this.loginForm.controls;
  }

  async login() {
    this.isSubmitted = true;
    
    if (!this.loginForm.valid) {
      return;
    }
    
    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    
    try {
      console.log('Attempting login with credentials:', email);
      const user = await this.authService.login(email, password);
      
      if (user) {
        console.log('Login successful for user:', user.name, user.role);
        
        // Show success toast
        const successToast = await this.toastController.create({
          message: 'Login successful! Welcome ' + user.name,
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        await successToast.present();
        
        // If login is successful and user is an employee
        if (user.role === 'employee') {
          console.log('User is employee, checking for fingerprint capability');
          
          // Need to check biometric availability again here to ensure it's correctly detected
          const isBiometricAvailable = await this.biometricService.isAvailable();
          console.log('Fingerprint capability check after login:', isBiometricAvailable);
          
          if (isBiometricAvailable) {
            // Check if fingerprint is already enabled for this user
            const isEnabled = user.useFingerprintLogin || false;
            console.log('User fingerprint login status:', isEnabled);
            
            if (!isEnabled) {
              console.log('Prompting user to enable fingerprint login');
              // Add a delay before presenting fingerprint enrollment prompt
              // to ensure navigation completes first
              setTimeout(() => {
                this.askToEnableFingerprint(user);
              }, 1500);
            } else {
              console.log('Fingerprint already enabled for this user');
              
              // Show a toast to inform user
              const toast = await this.toastController.create({
                message: 'Fingerprint login is enabled for your account',
                duration: 3000,
                position: 'bottom',
                color: 'info'
              });
              await toast.present();
            }
          } else {
            console.log('Biometric authentication not available on this device');
          }
        } else {
          console.log('Admin users do not use fingerprint authentication');
        }
      } else {
        console.log('Login failed - invalid credentials');
        const toast = await this.toastController.create({
          message: 'Invalid email or password. Please try again.',
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error during login:', error);
      const toast = await this.toastController.create({
        message: 'An error occurred. Please try again later.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  async askToEnableFingerprint(user: User) {
    console.log('Showing fingerprint enrollment prompt for user:', user.email);
    
    const alert = await this.alertController.create({
      header: 'Enable Fingerprint Login',
      message: 'Would you like to enable fingerprint authentication for faster login next time?',
      buttons: [
        {
          text: 'Not Now',
          role: 'cancel',
          handler: () => {
            console.log('User declined fingerprint enrollment');
            const toast = this.toastController.create({
              message: 'You can enable fingerprint login later from settings',
              duration: 2000,
              position: 'bottom',
              color: 'medium'
            });
            toast.then(t => t.present());
          }
        },
        {
          text: 'Enable',
          handler: async () => {
            console.log('User accepted fingerprint enrollment');
            // Show a loading toast
            const loadingToast = await this.toastController.create({
              message: 'Setting up fingerprint login...',
              duration: 2000,
              position: 'bottom'
            });
            await loadingToast.present();
            
            try {
              // Attempt to enable fingerprint login
              const enabled = await this.authService.enableFingerprintLogin(user);
              
              if (enabled) {
                console.log('Fingerprint login enabled successfully');
                const toast = await this.toastController.create({
                  message: 'Fingerprint login has been enabled! You can now use your fingerprint for future logins.',
                  duration: 3000,
                  position: 'bottom',
                  color: 'success'
                });
                await toast.present();
              } else {
                console.log('Failed to enable fingerprint login');
                const toast = await this.toastController.create({
                  message: 'Could not enable fingerprint login. Please try again later.',
                  duration: 3000,
                  position: 'bottom',
                  color: 'danger'
                });
                await toast.present();
              }
            } catch (error) {
              console.error('Error enabling fingerprint:', error);
              const toast = await this.toastController.create({
                message: 'An error occurred while enabling fingerprint login.',
                duration: 3000,
                position: 'bottom',
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
