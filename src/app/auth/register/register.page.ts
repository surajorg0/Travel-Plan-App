import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController, IonIcon, IonNote } from '@ionic/angular/standalone';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonNote, IonIcon, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonBackButton,
    IonButtons,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonSpinner,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      birthDate: [''],
      interests: [[]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  };

  get errorControl() {
    return this.registerForm.controls;
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async register() {
    this.isSubmitted = true;
    
    if (!this.registerForm.valid) {
      return;
    }
    
    this.isLoading = true;
    
    try {
      const userData = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        role: 'employee' as 'admin' | 'employee',
        birthDate: this.registerForm.value.birthDate,
        interests: this.registerForm.value.interests,
        status: 'pending'
      };
      
      const user = await this.authService.register(userData);
      
      if (user) {
        const toast = await this.toastController.create({
          message: 'Registration successful! Your account is pending approval by an administrator.',
          duration: 3000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
        
        this.router.navigate(['/auth/login']);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'An error occurred during registration. Please try again.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }
}
