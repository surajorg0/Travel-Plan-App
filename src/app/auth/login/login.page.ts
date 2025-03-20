import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  AlertController,
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle, 
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
import { airplaneOutline, fingerPrintOutline } from 'ionicons/icons';
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
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
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
      fingerPrintOutline
    });
  }

  ngOnInit() {
    this.initForm();
    this.checkAuth();
    this.checkBiometricAvailability();
  }

  async checkAuth() {
    const isAuthenticated = await this.authService.isAuthenticated();
    if (isAuthenticated) {
      const isAdmin = await this.authService.isAdmin();
      if (isAdmin) {
        this.router.navigate(['/pages/admin-dashboard']);
      } else {
        this.router.navigate(['/pages/employee-dashboard']);
      }
    }
  }

  async checkBiometricAvailability() {
    try {
      this.isFingerprintAvailable = await this.biometricService.isAvailable();
      
      // If fingerprint is available and there's a registered user for fingerprint auth
      if (this.isFingerprintAvailable && await this.authService.isFingerprintEnabled()) {
        this.authenticateWithFingerprint();
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      this.isFingerprintAvailable = false;
    }
  }

  async authenticateWithFingerprint() {
    try {
      const authenticated = await this.biometricService.authenticate();
      
      if (authenticated) {
        this.isLoading = true;
        const user = await this.authService.loginWithFingerprint();
        
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
          const toast = await this.toastController.create({
            message: 'Fingerprint recognized but user not found. Please log in with credentials.',
            duration: 3000,
            position: 'bottom',
            color: 'warning'
          });
          await toast.present();
        }
      }
    } catch (error) {
      console.error('Error during fingerprint authentication:', error);
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
      const user = await this.authService.login(email, password);
      
      if (user) {
        // If login is successful and user is not admin
        if (user.role === 'employee' && this.isFingerprintAvailable) {
          // Check if user wants to enable fingerprint login
          if (!user.useFingerprintLogin) {
            await this.askToEnableFingerprint(user);
          }
        }
      } else {
        const toast = await this.toastController.create({
          message: 'Invalid email or password. Please try again.',
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        await toast.present();
      }
    } catch (error) {
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
    const alert = await this.alertController.create({
      header: 'Enable Fingerprint Login',
      message: 'Would you like to enable fingerprint login for faster access next time?',
      buttons: [
        {
          text: 'Not Now',
          role: 'cancel'
        },
        {
          text: 'Enable',
          handler: async () => {
            const enabled = await this.authService.enableFingerprintLogin(user);
            if (enabled) {
              const toast = await this.toastController.create({
                message: 'Fingerprint login has been enabled!',
                duration: 2000,
                position: 'bottom',
                color: 'success'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
