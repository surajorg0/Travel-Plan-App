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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonRow,
  IonCol,
  IonGrid,
  IonInput,
  IonTextarea,
  ToastController,
  AlertController,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  documentTextOutline,
  airplaneOutline,
  peopleOutline,
  calendarOutline,
  helpBuoyOutline,
  albumsOutline,
  logOutOutline,
  notificationsOutline,
  checkmarkCircleOutline,
  shareSocialOutline,
  timeOutline,
  megaphoneOutline,
  statsChartOutline
} from 'ionicons/icons';

import { AuthService, User } from 'src/app/services/auth.service';

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface Activity {
  id: number;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonRow,
    IonCol,
    IonGrid,
    IonInput,
    IonTextarea,
    CommonModule,
    FormsModule,
    RouterModule,
    IonBadge
  ]
})
export class AdminDashboardPage implements OnInit {
  user: User | null = null;
  today = new Date();
  notificationCount = 0;
  stats = {
    employeeCount: 0,
    tourCount: 0,
    pendingApprovals: 0,
    openTickets: 0
  };
  
  recentActivity: Activity[] = [];
  
  newAnnouncement: Partial<Announcement> = {
    title: '',
    content: ''
  };

  pendingUsersCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      homeOutline,
      documentTextOutline,
      airplaneOutline,
      peopleOutline,
      calendarOutline,
      helpBuoyOutline,
      albumsOutline,
      logOutOutline,
      notificationsOutline,
      checkmarkCircleOutline,
      shareSocialOutline,
      timeOutline,
      megaphoneOutline,
      statsChartOutline
    });
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
      
      // The Auth Guard should handle redirects, so we don't need to do it here
      // Just make sure we have a valid user
      if (this.user) {
        // Load mock data
        this.loadMockData();
        
        // Get pending users count
        await this.getPendingUsersCount();
      }
    } catch (error) {
      console.error('Error initializing admin dashboard:', error);
    }
  }

  loadMockData() {
    // Mock stats
    this.stats = {
      employeeCount: 12,
      tourCount: 3,
      pendingApprovals: 5,
      openTickets: 2
    };
    
    // Mock notifications
    this.notificationCount = 5;
    
    // Mock recent activity
    this.recentActivity = [
      {
        id: 1,
        description: 'New stay-back request from John Employee',
        timestamp: new Date().toISOString(),
        icon: 'calendar-outline',
        color: 'primary'
      },
      {
        id: 2,
        description: 'New support ticket: Flight booking issue',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        icon: 'help-buoy-outline',
        color: 'danger'
      },
      {
        id: 3,
        description: 'Document uploaded: Visa for Paris Tour',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        icon: 'document-text-outline',
        color: 'success'
      },
      {
        id: 4,
        description: 'New employee registered: Alice Johnson',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        icon: 'person-add-outline',
        color: 'secondary'
      }
    ];
  }

  async toggleNotifications() {
    const alert = await this.alertController.create({
      header: 'Notifications',
      message: 'You have 5 pending approval requests and notifications.',
      buttons: ['OK']
    });
    
    await alert.present();
  }

  async postAnnouncement() {
    if (!this.newAnnouncement.title || !this.newAnnouncement.content) {
      const toast = await this.toastController.create({
        message: 'Please provide both title and content for the announcement.',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      return;
    }
    
    // In a real app, this would be sent to a service
    const toast = await this.toastController.create({
      message: 'Announcement posted successfully!',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
    
    // Reset form
    this.newAnnouncement = {
      title: '',
      content: ''
    };
  }

  async logout() {
    try {
      await this.authService.logout();
      // Logout is handled by the auth service, including navigation to login page
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  async getPendingUsersCount() {
    try {
      const pendingUsers = await this.authService.getPendingUsers();
      this.pendingUsersCount = pendingUsers.length;
    } catch (error) {
      console.error('Error getting pending users count:', error);
      this.pendingUsersCount = 0;
    }
  }
}
