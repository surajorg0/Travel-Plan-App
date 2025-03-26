import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonProgressBar,
  ActionSheetController,
  AlertController,
  ToastController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  imageOutline,
  locationOutline,
  trophyOutline,
  checkmarkCircleOutline,
  timeOutline,
  medalOutline,
  starOutline,
  star,
  closeOutline,
  heartOutline,
  heart,
  shareOutline,
  chevronForwardOutline,
  ribbonOutline,
  arrowUpCircleOutline,
  trashOutline
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AuthService, User } from 'src/app/services/auth.service';
import { UiService } from 'src/app/services/ui.service';

interface Destination {
  id: number;
  name: string;
  image: string;
  points: number;
  description: string;
  isCompleted: boolean;
}

interface UserPhoto {
  id: string;
  destinationId: number;
  imagePath: string;
  date: Date;
  location: string;
  caption: string;
  likes: number;
  isLiked: boolean;
}

interface Achievement {
  id: number;
  name: string;
  icon: string;
  description: string;
  isUnlocked: boolean;
  progress: number;
  total: number;
}

@Component({
  selector: 'app-travel-game',
  templateUrl: './travel-game.page.html',
  styleUrls: ['./travel-game.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonProgressBar
  ]
})
export class TravelGamePage implements OnInit, OnDestroy {
  user: User | null = null;
  isLoading = false;
  totalPoints = 0;
  
  // Game data
  destinations: Destination[] = [];
  userPhotos: UserPhoto[] = [];
  achievements: Achievement[] = [];
  
  // Selected destination for photo upload
  selectedDestination: Destination | null = null;
  
  // Active tab
  activeTab = 'destinations';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private uiService: UiService
  ) {
    addIcons({
      cameraOutline,
      imageOutline,
      locationOutline,
      trophyOutline,
      checkmarkCircleOutline,
      timeOutline,
      medalOutline,
      starOutline,
      star,
      closeOutline,
      heartOutline,
      heart,
      shareOutline,
      chevronForwardOutline,
      ribbonOutline,
      arrowUpCircleOutline,
      trashOutline
    });
  }

  async ngOnInit() {
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
    
    // Load mock data
    this.loadMockData();
    
    // Hide the footer on the game page
    this.uiService.hideFooter();
  }
  
  ngOnDestroy() {
    // Show the footer when leaving this page
    this.uiService.showFooter();
  }
  
  loadMockData() {
    // Mock destinations
    this.destinations = [
      {
        id: 1,
        name: 'Burj Khalifa',
        image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090',
        points: 100,
        description: 'Capture a photo of yourself at the tallest building in the world!',
        isCompleted: false
      },
      {
        id: 2,
        name: 'Palm Jumeirah',
        image: 'https://images.unsplash.com/photo-1578505031397-b137e3a7858b',
        points: 75,
        description: 'Visit the iconic palm-shaped artificial archipelago.',
        isCompleted: false
      },
      {
        id: 3,
        name: 'Dubai Mall',
        image: 'https://images.unsplash.com/photo-1606735389855-8a31bd8f8bd3',
        points: 50,
        description: 'Take a photo in front of the Dubai Mall Fountain or Aquarium.',
        isCompleted: false
      },
      {
        id: 4,
        name: 'Dubai Marina',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
        points: 60,
        description: 'Capture the beautiful Dubai Marina skyline.',
        isCompleted: false
      },
      {
        id: 5,
        name: 'Desert Safari',
        image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3',
        points: 90,
        description: 'Share your desert safari adventure!',
        isCompleted: false
      }
    ];
    
    // Mock user photos
    this.userPhotos = [
      {
        id: '1',
        destinationId: 3,
        imagePath: 'https://images.unsplash.com/photo-1582672060936-9bc21855c231',
        date: new Date(Date.now() - 86400000 * 7), // 7 days ago
        location: 'Dubai Mall',
        caption: 'Amazing time at the Dubai Mall!',
        likes: 15,
        isLiked: false
      }
    ];
    
    // Mock achievements
    this.achievements = [
      {
        id: 1,
        name: 'Explorer',
        icon: 'location-outline',
        description: 'Visit 3 destinations',
        isUnlocked: false,
        progress: this.userPhotos.length,
        total: 3
      },
      {
        id: 2,
        name: 'Collector',
        icon: 'camera-outline',
        description: 'Upload 5 photos',
        isUnlocked: false,
        progress: this.userPhotos.length,
        total: 5
      },
      {
        id: 3,
        name: 'Dubai Master',
        icon: 'trophy-outline',
        description: 'Complete all destinations',
        isUnlocked: false,
        progress: this.userPhotos.length,
        total: this.destinations.length
      }
    ];
    
    // Update destinations completed status
    this.destinations.forEach(dest => {
      dest.isCompleted = this.userPhotos.some(p => p.destinationId === dest.id);
    });
    
    // Update achievements
    this.updateAchievements();
    
    // Calculate total points
    this.calculateTotalPoints();
  }
  
  calculateTotalPoints() {
    this.totalPoints = 0;
    
    // Points from completed destinations
    this.userPhotos.forEach(photo => {
      const destination = this.destinations.find(d => d.id === photo.destinationId);
      if (destination) {
        this.totalPoints += destination.points;
      }
    });
    
    // Points from unlocked achievements
    this.achievements.forEach(achievement => {
      if (achievement.isUnlocked) {
        this.totalPoints += 50; // 50 points per achievement
      }
    });
  }
  
  updateAchievements() {
    // Update "Explorer" achievement
    const uniqueDestinations = new Set(this.userPhotos.map(p => p.destinationId));
    this.achievements[0].progress = uniqueDestinations.size;
    this.achievements[0].isUnlocked = uniqueDestinations.size >= this.achievements[0].total;
    
    // Update "Collector" achievement
    this.achievements[1].progress = this.userPhotos.length;
    this.achievements[1].isUnlocked = this.userPhotos.length >= this.achievements[1].total;
    
    // Update "Dubai Master" achievement
    const completedDestinations = this.destinations.filter(d => d.isCompleted).length;
    this.achievements[2].progress = completedDestinations;
    this.achievements[2].isUnlocked = completedDestinations >= this.achievements[2].total;
  }
  
  switchTab(tab: string) {
    this.activeTab = tab;
  }
  
  async selectDestination(destination: Destination) {
    this.selectedDestination = destination;
    
    // Show options for taking a photo
    const actionSheet = await this.actionSheetController.create({
      header: 'Upload Photo for ' + destination.name,
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera-outline',
          handler: () => {
            this.takePicture(destination, CameraSource.Camera);
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'image-outline',
          handler: () => {
            this.takePicture(destination, CameraSource.Photos);
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
  
  async takePicture(destination: Destination, source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source
      });
      
      if (image.dataUrl) {
        // Show caption dialog
        this.showCaptionDialog(destination, image.dataUrl);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }
  
  async showCaptionDialog(destination: Destination, imageDataUrl: string) {
    const alert = await this.alertController.create({
      header: 'Add Caption',
      inputs: [
        {
          name: 'caption',
          type: 'text',
          placeholder: 'Write a caption for your photo...'
        },
        {
          name: 'location',
          type: 'text',
          value: destination.name,
          placeholder: 'Location'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.savePhoto(destination, imageDataUrl, data.caption, data.location);
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  async savePhoto(destination: Destination, imageDataUrl: string, caption: string, location: string) {
    this.isLoading = true;
    
    try {
      // In a real app, upload the image to a server
      // For the mock app, we'll just add it to our local array
      
      // Generate a random ID
      const photoId = Math.random().toString(36).substring(2, 10);
      
      // Create a new photo object
      const newPhoto: UserPhoto = {
        id: photoId,
        destinationId: destination.id,
        imagePath: imageDataUrl,
        date: new Date(),
        location: location || destination.name,
        caption: caption || 'Photo from ' + destination.name,
        likes: 0,
        isLiked: false
      };
      
      // Add to the photos array
      this.userPhotos.unshift(newPhoto);
      
      // Mark destination as completed
      const destIndex = this.destinations.findIndex(d => d.id === destination.id);
      if (destIndex >= 0) {
        this.destinations[destIndex].isCompleted = true;
      }
      
      // Update achievements
      this.updateAchievements();
      
      // Calculate total points
      this.calculateTotalPoints();
      
      // Show success toast with points earned
      const toast = await this.toastController.create({
        message: `Photo added! You earned ${destination.points} points!`,
        duration: 3000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      
      // Switch to the gallery tab
      this.switchTab('gallery');
      
    } catch (error) {
      console.error('Error saving photo:', error);
      const toast = await this.toastController.create({
        message: 'Error saving photo. Please try again.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }
  
  async likePhoto(photo: UserPhoto) {
    photo.isLiked = !photo.isLiked;
    if (photo.isLiked) {
      photo.likes++;
    } else {
      photo.likes--;
    }
    
    const toast = await this.toastController.create({
      message: photo.isLiked ? 'Photo liked!' : 'Photo unliked',
      duration: 1500,
      position: 'bottom',
      color: photo.isLiked ? 'primary' : 'medium'
    });
    await toast.present();
  }
  
  async sharePhoto(photo: UserPhoto) {
    const alert = await this.alertController.create({
      header: 'Share Photo',
      message: 'This would share the photo with your team. This feature is coming soon!',
      buttons: ['OK']
    });
    await alert.present();
  }
  
  async deletePhoto(photo: UserPhoto) {
    const alert = await this.alertController.create({
      header: 'Delete Photo',
      message: 'Are you sure you want to delete this photo?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            // Remove the photo from the array
            const index = this.userPhotos.findIndex(p => p.id === photo.id);
            if (index >= 0) {
              this.userPhotos.splice(index, 1);
              
              // Check if this was the only photo for this destination
              const otherPhotosForDestination = this.userPhotos.some(p => p.destinationId === photo.destinationId);
              
              if (!otherPhotosForDestination) {
                // Mark destination as not completed
                const destIndex = this.destinations.findIndex(d => d.id === photo.destinationId);
                if (destIndex >= 0) {
                  this.destinations[destIndex].isCompleted = false;
                }
              }
              
              // Update achievements
              this.updateAchievements();
              
              // Calculate total points
              this.calculateTotalPoints();
              
              this.toastController.create({
                message: 'Photo deleted',
                duration: 2000,
                position: 'bottom',
                color: 'medium'
              }).then(toast => toast.present());
            }
          }
        }
      ]
    });
    await alert.present();
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 