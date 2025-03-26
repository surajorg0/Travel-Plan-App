import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { MustMatch } from '../../../utils/validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        department: [''],
        phoneNumber: [''],
        address: [''],
      },
      {
        validator: MustMatch('password', 'confirmPassword'),
      }
    );
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  async onSubmit() {
    this.submitted = true;

    // Stop if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    try {
      const loader = await this.loadingController.create({
        message: 'Creating your account...',
      });
      await loader.present();

      const { name, email, password, department, phoneNumber, address } = this.registerForm.value;

      const response = await this.authService.register({
        name,
        email,
        password,
        department,
        phoneNumber,
        address,
      });

      await loader.dismiss();
      this.loading = false;

      if (response.isApproved) {
        // If user is already approved (like admin users)
        this.router.navigate(['/login']);
        this.presentToast('Account created successfully! You can now log in.');
      } else {
        // For regular users that need approval
        const alert = await this.alertController.create({
          header: 'Registration Successful',
          message: 'Your account has been created successfully! You will be able to log in once an admin approves your account.',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                this.router.navigate(['/login']);
              },
            },
          ],
        });
        await alert.present();
      }
    } catch (error) {
      this.loading = false;
      await this.loadingController.dismiss();
      this.presentErrorAlert(error);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'success',
    });
    toast.present();
  }

  async presentErrorAlert(error: any) {
    const alert = await this.alertController.create({
      header: 'Registration Failed',
      message: error.message || 'Failed to create account. Please try again.',
      buttons: ['OK'],
    });
    await alert.present();
  }
} 