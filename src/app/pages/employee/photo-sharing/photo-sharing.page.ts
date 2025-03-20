import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonAvatar,
  ActionSheetController,
  ModalController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { StorageService } from 'src/app/services/storage.service';
import { addIcons } from 'ionicons';
import { 
  cameraOutline, 
  imageOutline, 
  cloudUploadOutline, 
  gridOutline, 
  listOutline,
  sunnyOutline,
  peopleOutline,
  heartOutline,
  heartSharp,
  shareOutline,
  trashOutline,
  locationOutline
} from 'ionicons/icons';

interface Photo {
  id: string;
  url: string;
  caption: string;
  location: string;
  date: string;
  userName: string;
  userAvatar: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface Destination {
  id: string;
  name: string;
  imageUrl: string;
  photoCount: number;
}

@Component({
  selector: 'app-photo-sharing',
  templateUrl: './photo-sharing.page.html',
  styleUrls: ['./photo-sharing.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonBadge,
    IonSegment,
    IonSegmentButton, 
    IonAvatar,
    CommonModule, 
    FormsModule
  ]
})
export class PhotoSharingPage implements OnInit {
  currentView: 'grid' | 'list' = 'grid';
  photos: Photo[] = [];
  popularDestinations: Destination[] = [];
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    slidesPerView: 1.2,
    spaceBetween: 10,
    autoplay: true
  };

  constructor(
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private storageService: StorageService
  ) {
    addIcons({
      cameraOutline,
      imageOutline,
      cloudUploadOutline,
      gridOutline,
      listOutline,
      sunnyOutline,
      peopleOutline,
      heartOutline,
      heartSharp,
      shareOutline,
      trashOutline,
      locationOutline
    });
  }

  async ngOnInit() {
    // Load photos from storage or initialize with sample data
    const storedPhotos = await this.storageService.get('photos');
    if (storedPhotos) {
      this.photos = storedPhotos;
    } else {
      this.initSampleData();
    }
    
    // Initialize popular destinations
    this.initPopularDestinations();
  }

  initSampleData() {
    // Sample photos data
    this.photos = [
      {
        id: '1',
        url: 'assets/samples/beach.jpg',
        caption: 'Beautiful sunset at Waikiki Beach',
        location: 'Honolulu, Hawaii',
        date: new Date(2023, 6, 15).toISOString(),
        userName: 'Suraj',
        userAvatar: 'assets/avatars/avatar1.jpg',
        likes: 24,
        comments: 5
      },
      {
        id: '2',
        url: 'assets/samples/eiffel.jpg',
        caption: 'City of lights never disappoints',
        location: 'Paris, France',
        date: new Date(2023, 5, 22).toISOString(),
        userName: 'Jane',
        userAvatar: 'assets/avatars/avatar2.jpg',
        likes: 18,
        comments: 3
      },
      {
        id: '3',
        url: 'assets/samples/safari.jpg',
        caption: 'Incredible wildlife spotting',
        location: 'Serengeti, Tanzania',
        date: new Date(2023, 4, 10).toISOString(),
        userName: 'Admin',
        userAvatar: 'assets/avatars/avatar3.jpg',
        likes: 32,
        comments: 7
      },
      {
        id: '4',
        url: 'assets/samples/temple.jpg',
        caption: 'Ancient architecture is breathtaking',
        location: 'Kyoto, Japan',
        date: new Date(2023, 3, 5).toISOString(),
        userName: 'Suraj',
        userAvatar: 'assets/avatars/avatar1.jpg',
        likes: 15,
        comments: 2
      },
      {
        id: '5',
        url: 'assets/samples/mountains.jpg',
        caption: 'Hiking to the top was worth it',
        location: 'Swiss Alps, Switzerland',
        date: new Date(2023, 2, 20).toISOString(),
        userName: 'Jane',
        userAvatar: 'assets/avatars/avatar2.jpg',
        likes: 27,
        comments: 4
      },
      {
        id: '6',
        url: 'assets/samples/market.jpg',
        caption: 'Local markets have the best food',
        location: 'Bangkok, Thailand',
        date: new Date(2023, 1, 12).toISOString(),
        userName: 'Admin',
        userAvatar: 'assets/avatars/avatar3.jpg',
        likes: 21,
        comments: 3
      }
    ];
    
    // Save to storage
    this.storageService.set('photos', this.photos);
  }

  initPopularDestinations() {
    this.popularDestinations = [
      {
        id: '1',
        name: 'Paris, France',
        imageUrl: 'assets/destinations/paris.jpg',
        photoCount: 42
      },
      {
        id: '2',
        name: 'Bali, Indonesia',
        imageUrl: 'assets/destinations/bali.jpg',
        photoCount: 38
      },
      {
        id: '3',
        name: 'Tokyo, Japan',
        imageUrl: 'assets/destinations/tokyo.jpg',
        photoCount: 29
      },
      {
        id: '4',
        name: 'New York, USA',
        imageUrl: 'assets/destinations/newyork.jpg',
        photoCount: 25
      }
    ];
  }

  segmentChanged(ev: any) {
    this.currentView = ev.detail.value;
  }

  async presentPhotoOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Add Photo',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera-outline',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'image-outline',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
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
        resultType: CameraResultType.Uri,
        source: source
      });
      
      if (image.webPath) {
        await this.promptPhotoDetails(image.webPath);
      }
    } catch (error) {
      console.error('Error taking picture', error);
    }
  }

  async promptPhotoDetails(photoPath: string) {
    const alert = await this.alertController.create({
      header: 'Photo Details',
      inputs: [
        {
          name: 'caption',
          type: 'text',
          placeholder: 'Add a caption'
        },
        {
          name: 'location',
          type: 'text',
          placeholder: 'Location'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Post',
          handler: (data) => {
            this.savePhoto(photoPath, data.caption, data.location);
          }
        }
      ]
    });
    await alert.present();
  }

  async savePhoto(photoPath: string, caption: string, location: string) {
    // In a real app, you would upload the photo to a server
    // For this sample, we'll just add it to our local array
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: photoPath,
      caption: caption || 'No caption',
      location: location || 'Unknown location',
      date: new Date().toISOString(),
      userName: 'Suraj', // Use current user name
      userAvatar: 'assets/avatars/avatar1.jpg',
      likes: 0,
      comments: 0
    };
    
    this.photos.unshift(newPhoto);
    
    // Save to storage (Android directory in a real app)
    await this.storageService.set('photos', this.photos);
    
    const toast = await this.toastController.create({
      message: 'Photo shared successfully!',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  async viewPhoto(photo: Photo) {
    const actionSheet = await this.actionSheetController.create({
      header: photo.caption,
      subHeader: photo.location,
      buttons: [
        {
          text: photo.isLiked ? 'Unlike' : 'Like',
          icon: photo.isLiked ? 'heart-sharp' : 'heart-outline',
          handler: () => {
            this.toggleLike(photo);
          }
        },
        {
          text: 'Comment',
          icon: 'chatbubble-outline',
          handler: () => {
            this.commentOnPhoto(photo);
          }
        },
        {
          text: 'Share',
          icon: 'share-outline',
          handler: () => {
            // Share functionality would go here
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async toggleLike(photo: Photo) {
    if (photo.isLiked) {
      photo.likes--;
      photo.isLiked = false;
    } else {
      photo.likes++;
      photo.isLiked = true;
    }
    
    // Update in storage
    await this.storageService.set('photos', this.photos);
  }

  async commentOnPhoto(photo: Photo) {
    const alert = await this.alertController.create({
      header: 'Add Comment',
      inputs: [
        {
          name: 'comment',
          type: 'textarea',
          placeholder: 'Write a comment...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Post',
          handler: (data) => {
            if (data.comment) {
              photo.comments++;
              
              // Update in storage
              this.storageService.set('photos', this.photos);
              
              // Show toast
              this.toastController.create({
                message: 'Comment added!',
                duration: 2000,
                position: 'bottom'
              }).then(toast => toast.present());
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
