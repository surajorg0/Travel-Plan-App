import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenu,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuButton,
  IonButtons,
  IonButton,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonRow,
  IonCol,
  IonAvatar,
  IonTextarea,
  ToastController,
  AlertController,
  ActionSheetController,
  ModalController,
  NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  documentTextOutline,
  imagesOutline,
  peopleOutline,
  calendarOutline,
  helpBuoyOutline,
  albumsOutline,
  logOutOutline,
  notificationsOutline,
  airplaneOutline,
  megaphoneOutline,
  giftOutline,
  ellipsisVerticalOutline,
  warningOutline,
  playCircleOutline,
  play,
  thumbsUpOutline,
  shareSocialOutline,
  appsOutline,
  airplaneSharp,
  bedOutline,
  restaurantOutline,
  carOutline,
  searchOutline,
  trophyOutline,
  heart,
  heartOutline,
  chatbubbleOutline,
  cameraOutline,
  personOutline,
  settingsOutline,
  closeOutline,
  paperPlaneOutline,
  menuOutline,
  logoYoutube,
  expandOutline,
  openOutline
} from 'ionicons/icons';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AuthService, User } from 'src/app/services/auth.service';

interface TrainingVideo {
  id: number;
  title: string;
  videoId: string;
  likes: number;
  shares: number;
}

interface EmployeeService {
  id: number;
  name: string;
  icon: string;
  route: string;
  color: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  image: string;
  likes: number;
  comments: number;
  liked: boolean;
}

interface Comment {
  id: number;
  user: string;
  text: string;
  date: Date;
  likes: number;
}

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.page.html',
  styleUrls: ['./employee-dashboard.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenu,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuButton,
    IonButtons,
    IonButton,
    IonBadge,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonRow,
    IonCol,
    IonAvatar,
    IonTextarea,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class EmployeeDashboardPage implements OnInit {
  @ViewChild('videoSlides') videoSlides: any;
  
  user: User | null = null;
  today = new Date();
  isBirthday = false;
  notificationCount = 0;
  newComment = '';
  totalComments = 0;
  showUserOptions = false;
  
  // Training videos data
  trainingVideos: TrainingVideo[] = [];
  
  // Employee services data
  employeeServices: EmployeeService[] = [];
  
  // Company achievements data
  companyAchievements: Achievement[] = [];
  
  // Comments data
  comments: Comment[] = [];
  
  // Add defaultUserIcon property
  defaultUserIcon: SafeResourceUrl;

  constructor(
    private authService: AuthService,
    public router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private navCtrl: NavController,
    private sanitizer: DomSanitizer
  ) {
    addIcons({
      homeOutline,
      documentTextOutline,
      imagesOutline,
      peopleOutline,
      calendarOutline,
      helpBuoyOutline,
      albumsOutline,
      logOutOutline,
      notificationsOutline,
      airplaneOutline,
      megaphoneOutline,
      giftOutline,
      ellipsisVerticalOutline,
      warningOutline,
      playCircleOutline,
      play,
      thumbsUpOutline,
      shareSocialOutline,
      appsOutline,
      airplaneSharp,
      bedOutline,
      restaurantOutline,
      carOutline,
      searchOutline,
      trophyOutline,
      heart,
      heartOutline,
      chatbubbleOutline,
      cameraOutline,
      personOutline,
      settingsOutline,
      closeOutline,
      paperPlaneOutline,
      menuOutline,
      logoYoutube,
      expandOutline,
      openOutline
    });
    
    // Generate default user icon as data URI
    this.defaultUserIcon = this.generateUserIcon();
  }

  async ngOnInit() {
    try {
      // Get current user
      this.user = this.authService.currentUserValue;
      
      if (!this.user) {
        // Try to initialize auth if user is not available
        await this.authService.initAuth();
        this.user = this.authService.currentUserValue;
      }
      
      // The Employee Guard should handle redirects, so we don't need to do it here
      // Just make sure we have a valid user
      if (this.user) {
        // Check if it's the user's birthday
        this.checkBirthday();
        
        // Load mock data
        this.loadMockData();
        
        // Remove any existing in-app-video-container elements
        this.removeVideoContainers();
      }
    } catch (error) {
      console.error('Error initializing employee dashboard:', error);
    }
  }

  ionViewDidEnter() {
    // Make sure to remove any video containers when the view enters
    this.removeVideoContainers();
  }
  
  private removeVideoContainers() {
    // Remove any existing in-app-video-container elements
    const videoContainers = document.querySelectorAll('#in-app-video-container, .in-app-video-container');
    if (videoContainers.length > 0) {
      console.log(`Page: Removing ${videoContainers.length} in-app-video-container elements`);
      videoContainers.forEach(container => container.remove());
    }
  }

  checkBirthday() {
    if (this.user?.birthDate) {
      const birthDate = new Date(this.user.birthDate);
      const today = new Date();
      
      // Check if it's the user's birthday (same month and day)
      if (birthDate.getMonth() === today.getMonth() && 
          birthDate.getDate() === today.getDate()) {
        this.isBirthday = true;
      }
    }
  }

  loadMockData() {
    // Mock notification count
    this.notificationCount = 3;
    
    // Mock training videos
    this.trainingVideos = [
      {
        id: 1,
        title: 'Dubai Travel Guide: Top Attractions',
        videoId: 'KztAOxpGfpo',
        likes: 423,
        shares: 89
      },
      {
        id: 2,
        title: 'Dubai City Tour 2025',
        videoId: 'wlKic6yTUUs',
        likes: 352,
        shares: 67
      },
      {
        id: 3,
        title: 'Dubai Burj Khalifa Experience',
        videoId: '-DR3W8L1oX8',
        likes: 517,
        shares: 128
      },
      {
        id: 4,
        title: 'Dubai Desert Safari Guide',
        videoId: 'o2h4RR9Qzv8',
        likes: 289,
        shares: 72
      },
      {
        id: 5,
        title: 'Hidden Gems in Dubai',
        videoId: 'VUmdHOHR7Qk',
        likes: 198,
        shares: 45
      }
    ];
    
    // Mock employee services
    this.employeeServices = [
      {
        id: 1,
        name: 'Documents',
        icon: 'document-text-outline',
        route: '/pages/employee/document-submission',
        color: 'blue-service'
      },
      {
        id: 2,
        name: 'Photos',
        icon: 'images-outline',
        route: '/pages/employee/photo-sharing',
        color: 'green-service'
      },
      {
        id: 3,
        name: 'Stay-back',
        icon: 'calendar-outline',
        route: '/pages/employee/stay-back-request',
        color: 'red-service'
      },
      {
        id: 4,
        name: 'Support',
        icon: 'help-buoy-outline',
        route: '/pages/employee/support-ticket',
        color: 'purple-service'
      },
      {
        id: 5,
        name: 'Mood Board',
        icon: 'albums-outline',
        route: '/pages/employee/mood-board',
        color: 'orange-service'
      },
      {
        id: 6,
        name: 'Team',
        icon: 'people-outline',
        route: '/pages/employee/team-insights',
        color: 'teal-service'
      },
      {
        id: 7,
        name: 'Travel Game',
        icon: 'trophy-outline',
        route: '/pages/employee/travel-game',
        color: 'yellow-service'
      },
      {
        id: 8,
        name: 'Profile',
        icon: 'person-outline',
        route: '/pages/profile',
        color: 'pink-service'
      }
    ];
    
    // Mock company achievements
    this.companyAchievements = [
      {
        id: 1,
        title: 'Dubai Office Expansion',
        description: 'Our company has successfully expanded with a new office in Dubai Marina.',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
        likes: 42,
        comments: 8,
        liked: false
      },
      {
        id: 2,
        title: 'Team Building in Burj Khalifa',
        description: 'Our team had an amazing team building event at the top of Burj Khalifa.',
        image: 'https://images.unsplash.com/photo-1582672060936-9bc21855c231',
        likes: 35,
        comments: 5,
        liked: false
      },
      {
        id: 3,
        title: 'Corporate Award 2023',
        description: 'We are proud to announce that our company won the Corporate Excellence Award 2023.',
        image: 'https://images.unsplash.com/photo-1551913902-c92207136625',
        likes: 68,
        comments: 12,
        liked: false
      }
    ];
    
    // Mock comments
    this.comments = [
      {
        id: 1,
        user: 'Jane Smith',
        text: 'The Dubai office looks amazing! Can\'t wait to visit.',
        date: new Date(Date.now() - 3600000),
        likes: 5
      },
      {
        id: 2,
        user: 'Mike Johnson',
        text: 'Congratulations on the corporate award! Well deserved.',
        date: new Date(Date.now() - 7200000),
        likes: 3
      }
    ];
    
    // Set total comments
    this.totalComments = this.comments.length;
  }

  async toggleNotifications() {
    const alert = await this.alertController.create({
      header: 'Notifications',
      message: 'You have 3 new notifications.',
      buttons: ['OK']
    });
    
    await alert.present();
  }
  
  async toggleUserOptions(event: any) {
    // Toggle dropdown visibility
    this.showUserOptions = !this.showUserOptions;
    
    // Close dropdown when clicking outside
    if (this.showUserOptions) {
      setTimeout(() => {
        const clickHandler = (e: any) => {
          const userDropdown = document.querySelector('.user-dropdown');
          const userProfile = document.querySelector('.user-profile');
          
          if (
            userDropdown && 
            userProfile && 
            !userDropdown.contains(e.target) && 
            !userProfile.contains(e.target)
          ) {
            this.showUserOptions = false;
            document.removeEventListener('click', clickHandler);
          }
        };
        
        document.addEventListener('click', clickHandler);
      }, 0);
    }
  }
  
  async selectProfilePhoto() {
    // In a real app, this would use Capacitor Camera API
    // For now, we'll simulate with an alert
    const alert = await this.alertController.create({
      header: 'Update Profile Photo',
      message: 'This would open your camera or photo gallery to select a new profile photo.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Simulate Upload',
          handler: () => {
            // Simulate updating profile photo
            const mockProfilePic = 'https://randomuser.me/api/portraits/lego/1.jpg';
            if (this.user) {
              this.user.profilePic = mockProfilePic;
            }
            
            // In a real app, would save to server/storage
            this.showToast('Profile photo updated!');
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    
    await toast.present();
  }
  
  async playVideo(videoId: string) {
    try {
      console.log('Creating video alert for:', videoId);
      
      // Remove any existing video elements
      const existingVideos = document.querySelectorAll('.in-app-video-container');
      existingVideos.forEach(video => {
        (video as HTMLElement).style.display = 'none';
        video.remove();
      });
      
      const htmlContent = `
        <div class="popup-video-container">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
      
      const alert = await this.alertController.create({
        header: 'Video Player',
        cssClass: 'video-player-alert',
        message: htmlContent,
        buttons: [
          {
            text: 'Close',
            role: 'cancel'
          },
          {
            text: 'Watch on YouTube',
            handler: () => {
              window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
              return false;
            }
          }
        ]
      });

      await alert.present();
      
      // Ensure the video container has proper styles
      setTimeout(() => {
        const videoContainers = document.querySelectorAll('.popup-video-container');
        videoContainers.forEach(container => {
          const iframe = container.querySelector('iframe');
          if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
          }
        });
      }, 100);
      
    } catch (error) {
      console.error('Error creating video alert:', error);
      const toast = await this.toastController.create({
        message: 'Could not play video. Please try again later.',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    }
  }
  
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
  
  likeAchievement(achievement: Achievement) {
    achievement.liked = !achievement.liked;
    if (achievement.liked) {
      achievement.likes++;
    } else {
      achievement.likes--;
    }
  }
  
  async viewComments(achievement: Achievement) {
    const alert = await this.alertController.create({
      header: 'Comments',
      message: 'This feature is coming soon!',
      buttons: ['OK']
    });
    
    await alert.present();
  }
  
  async postComment() {
    if (!this.newComment.trim()) {
      const toast = await this.toastController.create({
        message: 'Please enter a comment',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      return;
    }
    
    // Add new comment to the list
    const newCommentObj: Comment = {
      id: this.comments.length + 1,
      user: this.user?.name || 'Anonymous',
      text: this.newComment,
      date: new Date(),
      likes: 0
    };
    
    this.comments.unshift(newCommentObj);
    this.totalComments = this.comments.length;
    this.newComment = '';
    
    const toast = await this.toastController.create({
      message: 'Comment posted successfully',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }
  
  async viewAllComments() {
    // Create a list of all comments
    let commentsList = '';
    this.comments.forEach(comment => {
      const formattedDate = new Date(comment.date).toLocaleString();
      commentsList += `<div style="margin-bottom: 15px;"><strong>${comment.user}</strong> <span style="font-size: 0.8em; color: #777;">${formattedDate}</span><p>${comment.text}</p><div style="font-size: 0.8em; color: #777;">♥ ${comment.likes} likes</div></div>`;
    });
    
    const alert = await this.alertController.create({
      header: 'All Comments',
      message: commentsList || 'No comments yet',
      buttons: ['Close']
    });
    
    await alert.present();
  }

  async logout() {
    try {
      console.log('Employee logging out...');
      
      // Show confirmation alert
      const alert = await this.alertController.create({
        header: 'Logout',
        message: 'Are you sure you want to logout?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Logout',
            handler: async () => {
              // Show loading toast
              const loadingToast = await this.toastController.create({
                message: 'Logging out...',
                duration: 1000,
                position: 'bottom'
              });
              await loadingToast.present();
              
              // Call auth service logout
              await this.authService.logout();
              
              // Navigate to login page
              this.router.navigate(['/auth/login']);
              
              // Show success message
              const successToast = await this.toastController.create({
                message: 'You have been logged out successfully',
                duration: 2000,
                position: 'bottom',
                color: 'success'
              });
              await successToast.present();
            }
          }
        ]
      });
      
      await alert.present();
    } catch (error) {
      console.error('Error during logout:', error);
      const errorToast = await this.toastController.create({
        message: 'An error occurred during logout',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await errorToast.present();
    }
  }

  // Method to generate a user icon as a data URI
  generateUserIcon(): SafeResourceUrl {
    // Create an SVG user icon with blue color (#74C0FC)
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <!-- Font Awesome Free 6.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free -->
        <path fill="#74C0FC" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
      </svg>
    `;
    
    // Convert SVG to a data URI
    const dataUri = 'data:image/svg+xml;base64,' + btoa(svgContent);
    
    // Sanitize the URI to make it safe for use in img src
    return this.sanitizer.bypassSecurityTrustResourceUrl(dataUri);
  }
}
