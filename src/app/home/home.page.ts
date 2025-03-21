import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButtons, 
    IonButton, 
    IonIcon,
    CommonModule
  ]
})
export class HomePage {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
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
  }

  async initUser() {
    this.currentUser = this.authService.currentUserValue;
    if (!this.currentUser) {
      this.router.navigateByUrl('/auth/login');
    }
  }

  playVideo() {
    console.log('Play video clicked');
    // Implement video playback functionality
  }
}
