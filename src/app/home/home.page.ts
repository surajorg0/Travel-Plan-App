import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonButton, 
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  notificationsOutline, 
  ellipsisVertical, 
  alarmOutline, 
  play, 
  heart, 
  heartOutline, 
  shareOutline, 
  shareSocialOutline,
  chatbubbleOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButtons, 
    IonButton, 
    IonIcon
  ]
})
export class HomePage {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      notificationsOutline,
      ellipsisVertical,
      alarmOutline,
      play,
      heart,
      heartOutline,
      shareOutline,
      shareSocialOutline,
      chatbubbleOutline
    });
    
    this.initUser();
    console.log('HomePage component initialized');
  }

  async initUser() {
    try {
      this.currentUser = this.authService.currentUserValue;
      console.log('Current user:', this.currentUser);
      if (!this.currentUser) {
        console.log('No user found, redirecting to login');
        this.router.navigateByUrl('/auth/login');
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  }

  async playVideo() {
    console.log('Play video clicked');
    const toast = await this.toastController.create({
      message: 'Video playback will be implemented in the next update',
      duration: 2000,
      position: 'bottom',
      color: 'primary'
    });
    await toast.present();
  }
}
