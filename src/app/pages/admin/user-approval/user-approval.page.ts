import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonLoading,
  AlertController,
  ToastController,
  LoadingController,
  ModalController,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  refreshOutline, 
  checkmarkCircleOutline, 
  businessOutline, 
  calendarOutline, 
  callOutline, 
  locationOutline, 
  closeCircleOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  department?: string;
  createdAt: string;
  phoneNumber?: string;
  address?: string;
}

@Component({
  selector: 'app-user-approval',
  templateUrl: './user-approval.page.html',
  styleUrls: ['./user-approval.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonSpinner
  ]
})
export class UserApprovalPage implements OnInit {
  pendingUsers: PendingUser[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ 
      refreshOutline, 
      checkmarkCircleOutline, 
      businessOutline, 
      calendarOutline, 
      callOutline, 
      locationOutline, 
      closeCircleOutline,
      alertCircleOutline
    });
  }

  ngOnInit() {
    this.loadPendingUsers();
  }

  async loadPendingUsers() {
    this.isLoading = true;
    this.error = null;
    
    try {
      // Use the auth service to get pending users
      const users = await this.authService.getPendingUsers();
      this.pendingUsers = users;
    } catch (error) {
      console.error('Error loading pending users:', error);
      this.error = 'Failed to load pending users. Please try again.';
      this.showToast('Failed to load pending users', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async refreshPendingUsers(event: any) {
    this.error = null;
    try {
      // Use the auth service to get pending users
      const users = await this.authService.getPendingUsers();
      this.pendingUsers = users;
    } catch (error) {
      console.error('Error refreshing pending users:', error);
      this.error = 'Failed to refresh pending users. Please try again.';
      this.showToast('Failed to refresh pending users', 'danger');
    } finally {
      // Complete the refresh event
      event.target.complete();
    }
  }

  async approveUser(user: PendingUser) {
    const loading = await this.loadingController.create({
      message: 'Approving user...',
      duration: 2000
    });
    await loading.present();
    
    try {
      // Use the auth service to approve the user
      await this.authService.approveUser(user.id);
      this.pendingUsers = this.pendingUsers.filter(u => u.id !== user.id);
      this.showToast(`Successfully approved ${user.name}`, 'success');
    } catch (error) {
      console.error('Error approving user:', error);
      this.showToast('Failed to approve user', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async rejectUser(user: PendingUser) {
    const alert = await this.alertController.create({
      header: 'Confirm Rejection',
      message: `Are you sure you want to reject ${user.name}'s registration?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reject',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Rejecting user...',
              duration: 2000
            });
            await loading.present();
            
            try {
              // Use the auth service to reject the user
              await this.authService.rejectUser(user.id);
              this.pendingUsers = this.pendingUsers.filter(u => u.id !== user.id);
              this.showToast(`Successfully rejected ${user.name}`, 'success');
            } catch (error) {
              console.error('Error rejecting user:', error);
              this.showToast('Failed to reject user', 'danger');
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
} 