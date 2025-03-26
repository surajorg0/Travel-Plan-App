import { Component, OnInit, OnDestroy } from '@angular/core';
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
  IonCardSubtitle,
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
  contrastOutline,
  imagesOutline,
  personOutline,
  documentOutline,
  downloadOutline,
  eyeOutline,
  cloudUploadOutline,
  alertCircleOutline,
  documentTextOutline,
  checkmarkOutline,
  closeCircleOutline,
  checkmarkCircleOutline as checkmarkCircle,
  closeCircleOutline as closeCircle,
  timeOutline,
  calendarOutline,
  homeOutline,
  trophyOutline,
  addOutline
} from 'ionicons/icons';

import { AuthService, User } from 'src/app/services/auth.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { PhotoService, Photo } from 'src/app/services/photo.service';
import { StayBackService } from 'src/app/services/stay-back.service';
import { PostUploadModalComponent } from 'src/app/components/post-upload-modal/post-upload-modal.component';
import { UiService } from 'src/app/services/ui.service';

// Document interface remains the same
interface Document {
  id: string;
  title: string;
  type: 'passport' | 'visa' | 'id' | 'travel-insurance' | 'other';
  url: string;
  uploadDate: Date;
  status: 'approved' | 'rejected' | 'pending';
}

interface RequestedDocument {
  id: string;
  title: string;
  requestDate: Date;
  dueDate: Date;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
}

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
    IonCardSubtitle,
    IonAvatar,
    IonSpinner,
    IonChip,
    IonList,
    PostUploadModalComponent
  ]
})
export class ProfilePage implements OnInit, OnDestroy {
  user: User | null = null;
  profileForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  
  // Cover image and profile photo
  coverImage: string | null = null;
  selectedImage: string | null = null;
  originalImage: string | null = null;
  croppedImage: string | null = null;
  
  // Tab navigation
  activeTab: 'photos' | 'stay-back' | 'about' = 'photos';
  activeAboutTab: 'overview' | 'documents' | 'requested' = 'overview';
  
  // Photos, stay-back requests, and documents
  userPhotos: any[] = [];
  stayBackRequests: any[] = [];
  userDocuments: Document[] = [];
  requestedDocuments: RequestedDocument[] = [];
  
  // For interests
  availableInterests = [
    'Business Travel', 'Leisure Travel', 'Adventure', 'Cultural Experience',
    'Food Tourism', 'Shopping', 'Sightseeing', 'Beach Resorts',
    'Historical Sites', 'Safari', 'Cruise', 'Mountain Hiking'
  ];
  
  selectedInterests: string[] = [];
  
  // Post upload related properties
  newPost: {
    imageUrl: string | null;
    caption: string;
    location: string;
    tags: string[];
  } = {
    imageUrl: null,
    caption: '',
    location: '',
    tags: []
  };
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController,
    private photoService: PhotoService,
    private stayBackService: StayBackService,
    public uiService: UiService
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
      contrastOutline,
      imagesOutline,
      personOutline,
      documentOutline,
      downloadOutline,
      eyeOutline,
      cloudUploadOutline,
      alertCircleOutline,
      documentTextOutline,
      checkmarkOutline,
      closeCircleOutline,
      checkmarkCircle,
      closeCircle,
      timeOutline,
      calendarOutline,
      homeOutline,
      trophyOutline,
      addOutline
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
    if (this.user?.interests) {
      this.selectedInterests = [...this.user.interests];
    }
    
    // Load user photos from the service
    this.loadUserPhotos();
    
    // Load stay-back requests from the service
    this.loadStayBackRequests();
    
    // Load user documents
    this.loadUserDocuments();
    
    // Load requested documents
    this.loadRequestedDocuments();
    
    // Load cover image
    this.loadCoverImage();
    
    // Show the footer by default on profile main view
    this.uiService.showFooter();
  }
  
  ngOnDestroy() {
    // Always show footer when leaving this page
    this.uiService.showFooter();
  }
  
  initForm() {
    this.profileForm = this.formBuilder.group({
      name: [this.user?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      birthDate: [this.user?.birthDate || '', Validators.required],
      bio: [this.user?.bio || '', Validators.maxLength(150)],
      location: [this.user?.location || ''],
      jobTitle: [this.user?.jobTitle || ''],
      phoneNumber: [this.user?.phoneNumber || '']
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
        
        // Add additional fields from the form
        this.user.phoneNumber = this.profileForm.value.phoneNumber;
        this.user.location = this.profileForm.value.location;
        this.user.jobTitle = this.profileForm.value.jobTitle;
        this.user.bio = this.profileForm.value.bio;
        
        // Handle profile picture if changed
        if (this.croppedImage) {
          this.user.profilePic = this.croppedImage;
        }
        
        // Handle cover image if changed
        if (this.coverImage) {
          // Store the cover image
          await Preferences.set({
            key: 'user-cover-image',
            value: this.coverImage
          });
        }
        
        // Call the method from AuthService to update user
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
  
  async selectPhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          icon: 'image-outline',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Use Camera',
          icon: 'camera-outline',
          handler: () => {
            this.takePicture(CameraSource.Camera);
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
  
  async selectCoverPhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Cover Image',
      buttons: [
        {
          text: 'Load from Library',
          icon: 'image-outline',
          handler: () => {
            this.takeCoverPicture(CameraSource.Photos);
          }
        },
        {
          text: 'Use Camera',
          icon: 'camera-outline',
          handler: () => {
            this.takeCoverPicture(CameraSource.Camera);
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
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 500,
        height: 500
      });
      
      this.originalImage = image.dataUrl || null;
      this.croppedImage = image.dataUrl || null;
      
      // For a real app, we would upload to a server here
      // For now, just store in the user object
      if (this.user && this.croppedImage) {
        this.user.profilePic = this.croppedImage;
      }
      
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }
  
  async takeCoverPicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 1000, // Cover images are typically wider
        height: 300
      });
      
      this.coverImage = image.dataUrl || null;
      
      // For a real app, we would upload to a server here
      // For now, just store locally
      if (this.coverImage) {
        await Preferences.set({
          key: 'user-cover-image',
          value: this.coverImage
        });
      }
      
    } catch (error) {
      console.error('Error taking cover picture:', error);
    }
  }
  
  getDisplayImage(): string {
    if (this.user?.profilePic) {
      return this.user.profilePic;
    }
    return 'assets/default-avatar.png';
  }
  
  // Load user cover image
  async loadCoverImage() {
    const { value } = await Preferences.get({ key: 'user-cover-image' });
    if (value) {
      this.coverImage = value;
    }
  }
  
  // Photo related methods updated to use service
  loadUserPhotos() {
    if (this.user) {
      this.photoService.getUserPhotos(this.user.id).subscribe(photos => {
        this.userPhotos = photos;
        
        // If no photos from service, add dummy data
        if (this.userPhotos.length === 0) {
          this.userPhotos = [
            {
              id: '1',
              url: 'https://picsum.photos/id/1015/500/500',
              caption: 'Beautiful mountains during my business trip',
              status: 'approved',
              uploadDate: new Date('2023-10-15'),
              userId: this.user!.id,
              likes: 15,
              tags: ['mountains', 'business', 'travel']
            },
            {
              id: '2',
              url: 'https://picsum.photos/id/1019/500/500',
              caption: 'Amazing beach sunset after the conference',
              status: 'pending',
              uploadDate: new Date('2023-11-02'),
              userId: this.user!.id,
              likes: 0,
              tags: ['beach', 'sunset', 'conference']
            },
            {
              id: '3',
              url: 'https://picsum.photos/id/1039/500/500',
              caption: 'City skyline from my hotel room',
              status: 'rejected',
              rejectionReason: 'Not related to business travel',
              uploadDate: new Date('2023-09-28'),
              userId: this.user!.id,
              likes: 0,
              tags: ['city', 'skyline', 'hotel']
            },
            {
              id: '4',
              url: 'https://picsum.photos/id/164/500/500',
              caption: 'Team building activity on the company retreat',
              status: 'approved',
              uploadDate: new Date('2023-12-05'),
              userId: this.user!.id,
              likes: 27,
              tags: ['team', 'teambuilding', 'retreat']
            },
            {
              id: '5',
              url: 'https://picsum.photos/id/304/500/500',
              caption: 'Lunch with clients at the beachside restaurant',
              status: 'approved',
              uploadDate: new Date('2024-01-10'),
              userId: this.user!.id,
              likes: 32,
              tags: ['lunch', 'clients', 'restaurant']
            }
          ];
        }
      });
    } else {
      // Fallback to mock data if no user
      this.userPhotos = [
        {
          id: '1',
          url: 'https://picsum.photos/id/1015/500/500',
          caption: 'Beautiful mountains during my business trip',
          status: 'approved',
          uploadDate: new Date('2023-10-15'),
          userId: 'dummy-user',
          likes: 15,
          tags: ['mountains', 'business', 'travel']
        },
        {
          id: '2',
          url: 'https://picsum.photos/id/1019/500/500',
          caption: 'Amazing beach sunset after the conference',
          status: 'pending',
          uploadDate: new Date('2023-11-02'),
          userId: 'dummy-user',
          likes: 0,
          tags: ['beach', 'sunset', 'conference']
        },
        {
          id: '3',
          url: 'https://picsum.photos/id/1039/500/500',
          caption: 'City skyline from my hotel room',
          status: 'rejected',
          rejectionReason: 'Not related to business travel',
          uploadDate: new Date('2023-09-28'),
          userId: 'dummy-user',
          likes: 0,
          tags: ['city', 'skyline', 'hotel']
        },
        {
          id: '4',
          url: 'https://picsum.photos/id/164/500/500',
          caption: 'Team building activity on the company retreat',
          status: 'approved',
          uploadDate: new Date('2023-12-05'),
          userId: 'dummy-user',
          likes: 27,
          tags: ['team', 'teambuilding', 'retreat']
        },
        {
          id: '5',
          url: 'https://picsum.photos/id/304/500/500',
          caption: 'Lunch with clients at the beachside restaurant',
          status: 'approved',
          uploadDate: new Date('2024-01-10'),
          userId: 'dummy-user',
          likes: 32,
          tags: ['lunch', 'clients', 'restaurant']
        }
      ];
    }
  }
  
  async viewPhoto(photo: Photo) {
    // For now, just show details in an alert
    const alert = await this.alertController.create({
      header: photo.caption || 'Photo',
      message: `<img src="${photo.url}" style="width: 100%"><p><strong>Status:</strong> ${photo.status}</p>${photo.rejectionReason ? '<p><strong>Rejection Reason:</strong> ' + photo.rejectionReason + '</p>' : ''}`,
      buttons: ['Close']
    });
    
    await alert.present();
  }
  
  hasSelectedPhotos(): boolean {
    return this.userPhotos.some(photo => photo.selected);
  }
  
  async approveSelectedPhotos() {
    if (!this.hasSelectedPhotos()) return;
    
    let approved = 0;
    for (const photo of this.userPhotos) {
      if (photo.selected) {
        const success = await this.photoService.approvePhoto(photo.id);
        if (success) {
          photo.status = 'approved';
          photo.rejectionReason = undefined;
          photo.selected = false;
          approved++;
        }
      }
    }
    
    if (approved > 0) {
      this.presentToast(`${approved} photos approved successfully`);
    }
  }
  
  async rejectSelectedPhotos(reason: string) {
    if (!reason.trim()) {
      this.presentToast('A rejection reason is required', 'warning');
      return;
    }
    
    let rejected = 0;
    for (const photo of this.userPhotos) {
      if (photo.selected) {
        const success = await this.photoService.rejectPhoto(photo.id, reason);
        if (success) {
          photo.status = 'rejected';
          photo.rejectionReason = reason;
          photo.selected = false;
          rejected++;
        }
      }
    }
    
    if (rejected > 0) {
      this.presentToast(`${rejected} photos rejected with reason`);
    }
  }
  
  // Stay-back request related methods
  loadStayBackRequests() {
    if (this.user) {
      this.stayBackService.getUserRequests(this.user.id).subscribe(requests => {
        this.stayBackRequests = requests;
      });
    } else {
      // Fallback to mock data if no user
      this.stayBackRequests = [
        {
          id: '1',
          destination: 'Paris, France',
          startDate: new Date('2023-12-15'),
          endDate: new Date('2023-12-20'),
          reason: 'I would like to stay a few extra days to explore the city after the business conference.',
          status: 'approved'
        },
        {
          id: '2',
          destination: 'Tokyo, Japan',
          startDate: new Date('2024-01-10'),
          endDate: new Date('2024-01-15'),
          reason: 'After the tech summit, I want to visit some cultural sites in Tokyo.',
          status: 'pending'
        },
        {
          id: '3',
          destination: 'New York, USA',
          startDate: new Date('2023-11-05'),
          endDate: new Date('2023-11-08'),
          reason: 'Extended stay to meet with potential clients in the area.',
          status: 'rejected'
        }
      ];
    }
  }
  
  async approveStayBackRequest(requestId: string) {
    const success = await this.stayBackService.approveRequest(requestId);
    if (success) {
      // Update the local copy
      const request = this.stayBackRequests.find(r => r.id === requestId);
      if (request) {
        request.status = 'approved';
        request.rejectionReason = undefined;
      }
      this.presentToast('Stay-back request approved', 'success');
    } else {
      this.presentToast('Error approving request', 'danger');
    }
  }
  
  async openRejectStayBackDialog(requestId: string) {
    const alert = await this.alertController.create({
      header: 'Reject Stay-Back Request',
      message: 'Please provide a reason for rejecting this request:',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Rejection reason'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reject',
          handler: (data) => {
            if (data.reason) {
              this.rejectStayBackRequest(requestId, data.reason);
              return true;
            } else {
              this.presentToast('A rejection reason is required', 'warning');
              return false;
            }
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  async rejectStayBackRequest(requestId: string, reason: string) {
    const success = await this.stayBackService.rejectRequest(requestId, reason);
    if (success) {
      // Update the local copy
      const request = this.stayBackRequests.find(r => r.id === requestId);
      if (request) {
        request.status = 'rejected';
        request.rejectionReason = reason;
      }
      this.presentToast('Stay-back request rejected', 'success');
    } else {
      this.presentToast('Error rejecting request', 'danger');
    }
  }
  
  // Document related methods
  loadUserDocuments() {
    // In a real app, this would load from a service
    // For now, we use mock data
    this.userDocuments = [
      {
        id: '1',
        title: 'Passport',
        type: 'passport',
        url: 'assets/sample-document.pdf',
        uploadDate: new Date('2023-08-10'),
        status: 'approved'
      },
      {
        id: '2',
        title: 'Travel Insurance',
        type: 'travel-insurance',
        url: 'assets/sample-document.pdf',
        uploadDate: new Date('2023-09-05'),
        status: 'approved'
      },
      {
        id: '3',
        title: 'France Visa',
        type: 'visa',
        url: 'assets/sample-document.pdf',
        uploadDate: new Date('2023-10-22'),
        status: 'pending'
      }
    ];
  }
  
  loadRequestedDocuments() {
    // In a real app, this would load from a service
    // For now, we use mock data
    this.requestedDocuments = [
      {
        id: '1',
        title: 'Japan Visa Application',
        requestDate: new Date('2023-11-05'),
        dueDate: new Date('2023-12-01'),
        status: 'pending'
      },
      {
        id: '2',
        title: 'Updated Passport Copy',
        requestDate: new Date('2023-10-15'),
        dueDate: new Date('2023-11-15'),
        status: 'submitted'
      }
    ];
  }
  
  getDocumentIcon(type: string): string {
    switch (type) {
      case 'passport':
        return 'document-outline';
      case 'visa':
        return 'document-text-outline';
      case 'id':
        return 'card-outline';
      case 'travel-insurance':
        return 'shield-checkmark-outline';
      default:
        return 'document-outline';
    }
  }
  
  async viewDocument(document: Document) {
    // In a real app, this would open a document viewer
    // For now, just show a message
    const alert = await this.alertController.create({
      header: document.title,
      message: 'Document viewer would open here.',
      buttons: ['Close']
    });
    
    await alert.present();
  }
  
  async downloadDocument(document: Document) {
    // In a real app, this would download the document
    // For now, just show a message
    this.presentToast('Document download started', 'success');
  }
  
  // Helper methods for status indicators
  getStatusClass(status: string): string {
    return status;
  }
  
  getStatusIcon(status: string): string {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time-outline';
      default:
        return 'help-circle-outline';
    }
  }
  
  // Toast helper
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    
    await toast.present();
  }
  
  // Post upload functionality
  async openPostUploadModal() {
    const modal = await this.modalController.create({
      component: PostUploadModalComponent,
      cssClass: 'post-upload-modal'
    });
    
    await modal.present();
    
    const result = await modal.onDidDismiss();
    if (result.data) {
      // Process the post data
      this.uploadPost(
        result.data.caption,
        result.data.location,
        result.data.tags,
        result.data.photoUrl
      );
    }
  }
  
  async uploadPost(caption: string, location: string = '', tags: string[] = [], photoUrl: string | null = null) {
    if (!photoUrl || !this.user) {
      this.presentToast('Please select an image for your post', 'warning');
      return;
    }
    
    try {
      // Prepare the photo data
      const photoData = {
        url: photoUrl,
        caption: caption,
        location: location || undefined,
        userId: this.user.id,
        tags: tags
      };
      
      // Upload the photo using the service
      const newPhoto = await this.photoService.uploadPhoto(photoData);
      
      // Add to local array for immediate display
      this.userPhotos.unshift(newPhoto);
      
      this.presentToast('Post uploaded successfully! It will be visible after admin approval.', 'success');
    } catch (error) {
      console.error('Error uploading post:', error);
      this.presentToast('Error uploading post. Please try again.', 'danger');
    }
  }

  // Add the missing openRejectDialog method
  async openRejectDialog() {
    const alert = await this.alertController.create({
      header: 'Reject Photos',
      message: 'Please provide a reason for rejecting these photos:',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Rejection reason'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reject',
          handler: (data) => {
            if (data.reason) {
              this.rejectSelectedPhotos(data.reason);
              return true;
            } else {
              this.presentToast('A rejection reason is required', 'warning');
              return false;
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  // Update the setActiveTab method to hide the footer when viewing sections
  setActiveTab(tab: 'photos' | 'stay-back' | 'about') {
    this.activeTab = tab;
    
    // Hide the footer when viewing detail sections
    if (tab !== 'about') {
      this.uiService.hideFooter();
    } else {
      this.uiService.showFooter();
    }
  }
  
  // Navigate to stay-back request page
  navigateToStayBackRequest() {
    this.router.navigate(['/pages/employee/stay-back-request']);
  }
} 