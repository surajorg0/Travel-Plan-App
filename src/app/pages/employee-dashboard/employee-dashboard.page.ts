import { Component, OnInit } from '@angular/core';
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
  IonGrid,
  IonAvatar,
  ToastController,
  AlertController,
  IonSkeletonText
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
  giftOutline
} from 'ionicons/icons';

import { AuthService, User } from 'src/app/services/auth.service';

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface Tour {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Confirmed' | 'Cancelled';
}

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.page.html',
  styleUrls: ['./employee-dashboard.page.scss'],
  standalone: true,
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
    IonGrid,
    IonAvatar,
    IonSkeletonText,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class EmployeeDashboardPage implements OnInit {
  user: User | null = null;
  today = new Date();
  isBirthday = false;
  notificationCount = 0;
  stats = {
    pendingDocuments: 0,
    photos: 0,
    tickets: 0
  };
  upcomingTours: Tour[] = [];
  announcements: Announcement[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
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
      giftOutline
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
    // Mock stats
    this.stats = {
      pendingDocuments: 2,
      photos: 5,
      tickets: 1
    };
    
    // Mock notifications
    this.notificationCount = 3;
    
    // Mock upcoming tours
    this.upcomingTours = [
      {
        id: 1,
        destination: 'Paris, France',
        startDate: '2023-07-15',
        endDate: '2023-07-22',
        status: 'Confirmed'
      },
      {
        id: 2,
        destination: 'Tokyo, Japan',
        startDate: '2023-09-10',
        endDate: '2023-09-20',
        status: 'Upcoming'
      }
    ];
    
    // Mock announcements
    this.announcements = [
      {
        id: 1,
        title: 'New Travel Policy',
        content: 'Please review the updated travel policy before your next trip.',
        date: '2023-06-01'
      },
      {
        id: 2,
        title: 'Office Closure',
        content: 'The office will be closed on July 4th for Independence Day.',
        date: '2023-06-15'
      }
    ];
  }

  async toggleNotifications() {
    const alert = await this.alertController.create({
      header: 'Notifications',
      message: 'You have 3 new notifications.',
      buttons: ['OK']
    });
    
    await alert.present();
  }

  async logout() {
    await this.authService.logout();
    const toast = await this.toastController.create({
      message: 'You have been logged out successfully.',
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
