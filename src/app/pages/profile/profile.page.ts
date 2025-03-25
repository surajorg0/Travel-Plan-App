import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAvatar,
  IonSpinner,
  IonChip,
  IonList,
  ActionSheetController,
  ToastController,
  ModalController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  cameraOutline,
  createOutline,
  saveOutline,
  closeOutline,
  mailOutline,
  callOutline,
  calendarNumberOutline,
  briefcaseOutline,
  locationOutline,
  languageOutline,
  checkmarkCircleOutline,
  imageOutline,
  arrowBackOutline,
  cropOutline,
  contrastOutline
} from 'ionicons/icons';

import { AuthService, User } from 'src/app/services/auth.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonAvatar,
    IonSpinner,
    IonChip,
    IonList
  ]
})
export class ProfilePage implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  
  // For photo upload
  selectedImage: string | null = null;
  isCropping = false;
  originalImage: string | null = null;
  croppedImage: string | null = null;
  
  // For interests
  availableInterests = [
    'Business Travel', 'Leisure Travel', 'Adventure', 'Cultural Experience',
    'Food Tourism', 'Shopping', 'Sightseeing', 'Beach Resorts',
    'Historical Sites', 'Safari', 'Cruise', 'Mountain Hiking'
  ];
  
  selectedInterests: string[] = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    addIcons({
      personCircleOutline,
      cameraOutline,
      createOutline,
      saveOutline,
      closeOutline,
      mailOutline,
      callOutline,
      calendarNumberOutline,
      briefcaseOutline,
      locationOutline,
      languageOutline,
      checkmarkCircleOutline,
      imageOutline,
      arrowBackOutline,
      cropOutline,
      contrastOutline
    });
  }

  async ngOnInit() {
    // Get current user
    this.user = this.authService.currentUserValue;
    
    if (!this.user) {
      // If not authenticated, get user from storage
      await this.authService.initAuth();
      this.user = this.authService.currentUserValue;
      
      if (!this.user) {
        this.router.navigate(['/auth/login']);
        return;
      }
    }
    
    // Initialize form with user data
    this.initForm();
    
    // Load user interests if any
    if (this.user.interests) {
      this.selectedInterests = [...this.user.interests];
    }
  }
  
  initForm() {
    this.profileForm = this.formBuilder.group({
      name: [this.user?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      birthDate: [this.user?.birthDate || '', Validators.required],
      bio: ['', Validators.maxLength(150)],
      location: [''],
      jobTitle: [''],
      phoneNumber: ['']
    });
  }
  
  // Toggle edit mode
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    
    if (!this.isEditMode) {
      // Reset form to original values
      this.initForm();
    }
  }
  
  // Interest selection
  toggleInterest(interest: string) {
    const index = this.selectedInterests.indexOf(interest);
    if (index >= 0) {
      this.selectedInterests.splice(index, 1);
    } else {
      this.selectedInterests.push(interest);
    }
  }
  
  isInterestSelected(interest: string): boolean {
    return this.selectedInterests.includes(interest);
  }
  
  // Save profile changes
  async saveProfile() {
    if (!this.profileForm.valid) {
      const toast = await this.toastController.create({
        message: 'Please fill in all required fields correctly',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      return;
    }
    
    this.isLoading = true;
    
    try {
      // Update user object
      if (this.user) {
        this.user.name = this.profileForm.value.name;
        this.user.email = this.profileForm.value.email;
        this.user.birthDate = this.profileForm.value.birthDate;
        this.user.interests = [...this.selectedInterests];
        
        // Handle profile picture if changed
        if (this.croppedImage) {
          this.user.profilePic = this.croppedImage;
        }
        
        // Call the public method from AuthService to update user
        await this.authService['updateUserPreferences'](this.user);
        
        this.isEditMode = false;
        
        const toast = await this.toastController.create({
          message: 'Profile updated successfully',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const toast = await this.toastController.create({
        message: 'An error occurred while updating your profile',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }
  
  // Photo selection and cropping
  async selectPhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Photo Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Photo Library',
          icon: 'image-outline',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }
  
  async takePicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source
      });
      
      this.originalImage = image.dataUrl || null;
      
      // Start cropping
      if (this.originalImage) {
        this.isCropping = true;
        this.showCropInterface();
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }
  
  async showCropInterface() {
    // For simplicity, we're simulating crop with a dialog
    // In a real app, you would use a proper image cropping library like ngx-image-cropper
    
    const alert = await this.alertController.create({
      header: 'Crop Image',
      message: 'Image cropping simulation. In a real app, you would see a cropping interface here.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.isCropping = false;
            this.originalImage = null;
          }
        },
        {
          text: 'Crop',
          handler: () => {
            // Simulate cropped result
            this.croppedImage = this.originalImage;
            this.isCropping = false;
            
            // Show success message
            this.toastController.create({
              message: 'Image cropped successfully',
              duration: 2000,
              position: 'bottom',
              color: 'success'
            }).then(toast => toast.present());
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  getDisplayImage(): string {
    if (this.croppedImage) {
      return this.croppedImage;
    } else if (this.user?.profilePic) {
      return this.user.profilePic;
    }
    return 'assets/icon/employee-avatar.png';
  }
} 