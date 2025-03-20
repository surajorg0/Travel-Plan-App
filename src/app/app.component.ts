import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { StorageService } from './services/storage.service';
import { IonicModule } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Platform, AlertController } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonicModule],
  standalone: true,
})
export class AppComponent {
  private lastTimeBackPressed = 0;
  private currentRoute = '';

  constructor(
    private storageService: StorageService,
    private platform: Platform,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.setupBackButtonHandler();
      this.trackRouteChanges();
    });
  }

  private trackRouteChanges() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });
  }

  private setupBackButtonHandler() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      // Check if authenticated
      const isAuthenticated = await this.authService.isAuthenticated();
      
      // For login page, confirm exit
      if (this.currentRoute === '/auth/login') {
        this.showExitConfirmation();
        return;
      }
      
      // For dashboard pages, prevent going back to login
      if (isAuthenticated && 
         (this.currentRoute.includes('/pages/employee-dashboard') || 
          this.currentRoute.includes('/pages/admin-dashboard'))) {
        this.showExitConfirmation();
        return;
      }
      
      // For other authenticated pages, allow normal navigation
      if (isAuthenticated && this.currentRoute.includes('/pages/')) {
        window.history.back();
        return;
      }
      
      // Default behavior
      if (window.history.length > 1) {
        window.history.back();
      } else {
        this.showExitConfirmation();
      }
    });
  }
  
  private async showExitConfirmation() {
    const alert = await this.alertController.create({
      header: 'Exit App',
      message: 'Are you sure you want to exit the app?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            App.exitApp();
          }
        }
      ]
    });
    
    await alert.present();
  }
}
