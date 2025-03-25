import { Component, OnInit, isDevMode } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { StorageService } from './services/storage.service';
import { App } from '@capacitor/app';
import { Platform, AlertController, ToastController } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { LocalNotifications, LocalNotificationSchema, ActionPerformed } from '@capacitor/local-notifications';
import { register } from 'swiper/element/bundle';
import { Storage } from '@ionic/storage-angular';
import { Capacitor } from '@capacitor/core';
import { EnsureMenuDirective } from './directives/ensure-menu.directive';

// Register Swiper custom elements
register();

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
  notifications: boolean;
  sounds: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
    EnsureMenuDirective
  ]
})
export class AppComponent implements OnInit {
  private lastTimeBackPressed = 0;
  private currentRoute = '';
  private notificationSettings = {
    notifications: true
  };
  private defaultSettings: AppSettings = {
    theme: 'light',
    language: 'en',
    notifications: true,
    sounds: true,
    fontSize: 'medium'
  };

  constructor(
    private storageService: StorageService,
    private platform: Platform,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    console.log('App initialized');
    await this.initializeApp();
    
    // Remove any in-app-video-container elements that might be causing issues
    this.removeVideoContainers();
    
    // Set up observer to catch any dynamically added in-app-video-container elements
    this.observeDOMForVideoContainers();
    
    // Load notification settings
    await this.loadNotificationSettings();
    
    // Load saved theme from storage
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    }
    
    // Initialize notifications
    await this.initNotifications();

    // Add a listener for page navigation events to ensure menu works consistently
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      // Just log navigation - don't manipulate DOM here
      console.log('Navigation event:', event);
    });
  }

  private removeVideoContainers() {
    // Remove any existing in-app-video-container elements
    const videoContainers = document.querySelectorAll('#in-app-video-container, .in-app-video-container');
    if (videoContainers.length > 0) {
      console.log(`Removing ${videoContainers.length} in-app-video-container elements`);
      videoContainers.forEach(container => container.remove());
    }
  }
  
  private observeDOMForVideoContainers() {
    // Create a mutation observer to watch for dynamically added video containers
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // Check each added node
          mutation.addedNodes.forEach((node: Node) => {
            // Check if it's the element we want to remove
            if (node instanceof HTMLElement) {
              if (node.id === 'in-app-video-container' || node.classList.contains('in-app-video-container')) {
                console.log('Detected dynamically added in-app-video-container, removing it');
                node.remove();
              }
              
              // Also check children
              const containers = node.querySelectorAll('#in-app-video-container, .in-app-video-container');
              if (containers.length > 0) {
                console.log(`Removing ${containers.length} nested in-app-video-container elements`);
                containers.forEach(container => container.remove());
              }
            }
          });
        }
      });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
  }

  async initializeApp() {
    console.log('Initializing app...');
    try {
      this.platform.ready().then(async () => {
        console.log('Platform ready');
        this.setupBackButtonHandler();
        this.trackRouteChanges();
        this.showAppStartedToast();
        
        // Initialize platform and plugins
        if (Capacitor.isNativePlatform()) {
          try {
            // Request permissions for notifications
            await this.requestNotificationPermissions();
            
            // Load notification settings
            const settings = await this.loadNotificationSettings();
            
            // Schedule notifications if enabled
            if (settings.notifications) {
              this.scheduleNotifications();
            }
          } catch (error) {
            console.error('Error initializing notifications:', error);
          }
        }
        
        // Listen for app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) {
            // App is put into background
            this.scheduleNotifications();
          }
        });
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
      
      // Simple back button handling that doesn't redirect to login
      if (this.currentRoute === '/home' || this.currentRoute === '/auth/login') {
        // Only show exit confirmation on home or login page
        this.showExitConfirmation();
      } else {
        // For all other pages, just navigate back normally
        window.history.back();
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

  async requestNotificationPermissions() {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    }
    return false;
  }
  
  async loadNotificationSettings(): Promise<AppSettings> {
    try {
      const storedSettings = await this.storage.get('appSettings');
      if (storedSettings) {
        return storedSettings;
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
    return this.defaultSettings;
  }
  
  async scheduleNotifications() {
    try {
      // Cancel any existing notifications
      await LocalNotifications.cancel({ notifications: await (await LocalNotifications.getPending()).notifications });
      
      // Schedule a series of notifications with different delays
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: 'Travel Plans Waiting',
            body: 'Don\'t forget to check your travel itinerary!',
            schedule: { at: new Date(Date.now() + 5 * 60 * 1000) }, // 5 minutes
            actionTypeId: 'VIEW_ITINERARY'
          },
          {
            id: 2,
            title: 'New Travel Destinations',
            body: 'Explore new destinations with special deals just for you!',
            schedule: { at: new Date(Date.now() + 2 * 60 * 60 * 1000) }, // 2 hours
            actionTypeId: 'VIEW_DEALS'
          },
          {
            id: 3,
            title: 'Complete Your Profile',
            body: 'Update your travel preferences to get personalized recommendations!',
            schedule: { at: new Date(Date.now() + 6 * 60 * 60 * 1000) }, // 6 hours
            actionTypeId: 'UPDATE_PROFILE'
          },
          {
            id: 4,
            title: 'Daily Travel Tip',
            body: 'Check out today\'s tip for smarter travel planning.',
            schedule: { at: new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
            actionTypeId: 'VIEW_TIPS'
          }
        ]
      });
      
      // Register action types to handle notification taps
      LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'VIEW_ITINERARY',
            actions: [
              {
                id: 'view',
                title: 'View Itinerary'
              }
            ]
          },
          {
            id: 'VIEW_DEALS',
            actions: [
              {
                id: 'explore',
                title: 'Explore Deals'
              }
            ]
          },
          {
            id: 'UPDATE_PROFILE',
            actions: [
              {
                id: 'update',
                title: 'Update Now'
              }
            ]
          },
          {
            id: 'VIEW_TIPS',
            actions: [
              {
                id: 'view',
                title: 'View Tips'
              }
            ]
          }
        ]
      });
      
      // Listen for notification actions
      LocalNotifications.addListener('localNotificationActionPerformed', 
        (notification: ActionPerformed) => {
          this.handleNotificationAction(notification);
        }
      );
      
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }
  
  async initNotifications() {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'VIEW_ITINERARY',
          actions: [
            {
              id: 'view',
              title: 'View Itinerary'
            }
          ]
        },
        {
          id: 'VIEW_DEALS',
          actions: [
            {
              id: 'explore',
              title: 'Explore Deals'
            }
          ]
        },
        {
          id: 'UPDATE_PROFILE',
          actions: [
            {
              id: 'update',
              title: 'Update Now'
            }
          ]
        },
        {
          id: 'VIEW_TIPS',
          actions: [
            {
              id: 'view',
              title: 'View Tips'
            }
          ]
        }
      ]
    });
    
    // Handle notification actions
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      const { actionId, notification: notificationData } = notification;
      
      switch (notificationData.actionTypeId) {
        case 'VIEW_ITINERARY':
          window.location.href = '/pages/employee-dashboard';
          break;
        case 'VIEW_DEALS':
          window.location.href = '/pages/employee/travel-game';
          break;
        case 'UPDATE_PROFILE':
          window.location.href = '/pages/employee-dashboard';
          break;
        case 'VIEW_TIPS':
          window.location.href = '/pages/employee/photo-sharing';
          break;
      }
    });
  }

  handleNotificationAction(notification: ActionPerformed) {
    // Handle different actions based on actionTypeId
    switch (notification.notification.actionTypeId) {
      case 'VIEW_ITINERARY':
        // Navigate to itinerary page
        console.log('Navigate to itinerary');
        break;
      case 'VIEW_DEALS':
        // Navigate to deals page
        console.log('Navigate to deals');
        break;
      case 'UPDATE_PROFILE':
        // Navigate to profile page
        console.log('Navigate to profile');
        break;
      case 'VIEW_TIPS':
        // Navigate to tips page
        console.log('Navigate to tips');
        break;
    }
  }
}
