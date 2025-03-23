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
  ModalController
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
  closeOutline
} from 'ionicons/icons';

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

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController
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
      closeOutline
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
    
    // Check if it's the user's birthday
    this.checkBirthday();
    
    // Load mock data
    this.loadMockData();
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
        title: 'Dubai Travel Experience Guide',
        videoId: 'QNSCeNoGh_s', // Dubai Travel Guide
        likes: 45,
        shares: 12
      },
      {
        id: 2,
        title: 'Top 10 Things to Do in Dubai',
        videoId: '20QshTPiPgA', // Top 10 Things in Dubai
        likes: 32,
        shares: 8
      },
      {
        id: 3,
        title: 'Dubai Architecture & Future Vision',
        videoId: 'Rrr9cL1rFQU', // Dubai Architecture
        likes: 56,
        shares: 23
      },
      {
        id: 4,
        title: 'Dubai Cultural Awareness',
        videoId: 'I5v3qfzlwdM', // Dubai Culture
        likes: 38,
        shares: 15
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
    console.log('Playing video:', videoId);
    
    // Create a dynamic element-based modal for proper rendering
    const modalElement = document.createElement('div');
    modalElement.className = 'video-modal';
    modalElement.innerHTML = `
      <div class="video-modal-content">
        <div class="video-modal-header">
          <h3>Video Player</h3>
          <button class="close-button">&times;</button>
        </div>
        <div class="video-container">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      </div>
    `;
    
    // Add it to the body
    document.body.appendChild(modalElement);
    
    // Add some basic styles to make it work properly
    const style = document.createElement('style');
    style.textContent = `
      .video-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
      }
      
      .video-modal-content {
        width: 90%;
        max-width: 800px;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      }
      
      .video-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: var(--ion-color-primary);
        color: white;
      }
      
      .video-modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      .close-button {
        background: transparent;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
      }
      
      .video-container {
        position: relative;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
      }
      
      .video-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
    
    // Add close button functionality
    const closeButton = modalElement.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        document.body.removeChild(modalElement);
        document.head.removeChild(style);
      });
    }
    
    // Also close when clicking outside the modal content
    modalElement.addEventListener('click', (event) => {
      if (event.target === modalElement) {
        document.body.removeChild(modalElement);
        document.head.removeChild(style);
      }
    });
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
}
