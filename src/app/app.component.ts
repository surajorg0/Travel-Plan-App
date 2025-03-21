import { Component, OnInit, isDevMode } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { StorageService } from './services/storage.service';
import { App } from '@capacitor/app';
import { Platform, AlertController, ToastController } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  standalone: true,
})
export class AppComponent implements OnInit {
  private lastTimeBackPressed = 0;
  private currentRoute = '';

  constructor(
    private storageService: StorageService,
    private platform: Platform,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    console.log('App component initialized');
    this.initializeApp();
  }

  initializeApp() {
    console.log('Initializing app...');
    try {
      this.platform.ready().then(() => {
        console.log('Platform ready');
        this.setupBackButtonHandler();
        this.trackRouteChanges();
        this.showAppStartedToast();
      }).catch(error => {
        console.error('Error in platform ready:', error);
      });
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  private trackRouteChanges() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      console.log('Navigation to:', this.currentRoute);
    });
  }

  private setupBackButtonHandler() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      console.log('Back button pressed on route:', this.currentRoute);
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
      
      // For home page
      if (this.currentRoute === '/home') {
        this.showExitConfirmation();
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

  private async showAppStartedToast() {
    if (isDevMode()) {
      const toast = await this.toastController.create({
        message: 'App initialized successfully!',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    }
  }
}
