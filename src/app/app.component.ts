import { Component, OnInit, isDevMode, NgZone } from '@angular/core';
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
import { UiService } from './services/ui.service';

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
    IonRouterOutlet
  ]
})
export class AppComponent implements OnInit {
  private lastTimeBackPressed = 0;
  private currentRoute: string = '';
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
  private timePeriodToExit = 2000;
  private navigationStack: string[] = [];
  private isExitApp = false;

  constructor(
    private storageService: StorageService,
    private platform: Platform,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private storage: Storage,
    private uiService: UiService,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    await this.storage.create();
    console.log('App initialized');
    this.initializeApp();
    
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

    this.setupRouteTracking();
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

  private initializeApp() {
    this.platform.ready().then(async () => {
      // Set up back button handler and app state
      this.setupBackButtonHandler();
      this.handleAppState();
      
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
    });
  }

  private setupBackButtonHandler() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      // Get the current route
      const currentUrl = this.router.url;
      console.log('Back button pressed on:', currentUrl, 'Navigation stack:', [...this.navigationStack]);
      
      // Don't handle back button if a modal or alert is open
      const hasOpenOverlays = document.querySelector('ion-alert, ion-modal, ion-action-sheet, ion-popover') !== null;
      if (hasOpenOverlays) {
        console.log('Overlay detected, letting the overlay handle back button');
        return;
      }
      
      // Special handling for login - always exit app
      if (currentUrl === '/login' || currentUrl === '/auth/login') {
        console.log('On login page, showing exit prompt');
        this.handleExit();
        return;
      }
      
      // Special handling for dashboard pages
      const isDashboard = 
        currentUrl === '/employee-dashboard' || 
        currentUrl === '/pages/employee-dashboard' || 
        currentUrl === '/admin-dashboard' || 
        currentUrl === '/pages/admin-dashboard';
      
      if (isDashboard) {
        console.log('On dashboard, showing exit prompt');
        // Always show exit confirmation on dashboard, regardless of navigation history
        this.handleExit();
        return;
      }
      
      // For all other pages, standard navigation logic
      console.log('Standard back navigation with stack:', [...this.navigationStack]);
      
      // If we have routes in our navigation stack, go back to the previous route
      if (this.navigationStack.length > 1) {
        this.navigationStack.pop(); // Remove current route
        const previousRoute = this.navigationStack[this.navigationStack.length - 1];
        
        console.log('Navigating to previous route:', previousRoute);
        this.ngZone.run(() => {
          this.router.navigateByUrl(previousRoute);
        });
        return;
      }
      
      // Default to standard history navigation
      if (window.history.length > 1) {
        console.log('Using window history back');
        window.history.back();
        return;
      }
      
      // If all else fails, go to the dashboard based on role
      const currentUser = this.authService.currentUserValue;
      const defaultRoute = currentUser && currentUser.role === 'admin' ? '/pages/admin-dashboard' : '/pages/employee-dashboard';
      
      console.log('Fallback navigation to:', defaultRoute);
      this.ngZone.run(() => {
        this.router.navigateByUrl(defaultRoute);
      });
    });
  }
  
  private setupRouteTracking() {
    // Track navigation to build a history stack
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('Navigation to:', event.urlAfterRedirects, 'Stack before:', [...this.navigationStack]);
        
        // Handle login page specially - don't add to stack
        if (event.urlAfterRedirects === '/login' || event.urlAfterRedirects === '/auth/login') {
          // If going to login page, clear the stack completely
          this.navigationStack = [];
          console.log('Cleared navigation stack for login page');
          return;
        }
        
        // Special case: when navigating to dashboard directly or from login,
        // clear the stack to ensure back button shows exit prompt
        const isDashboard = 
          event.urlAfterRedirects === '/employee-dashboard' || 
          event.urlAfterRedirects === '/pages/employee-dashboard' || 
          event.urlAfterRedirects === '/admin-dashboard' || 
          event.urlAfterRedirects === '/pages/admin-dashboard';
          
        if (isDashboard && 
           (this.navigationStack.length === 0 || 
            this.navigationStack[this.navigationStack.length - 1] === '/login' ||
            this.navigationStack[this.navigationStack.length - 1] === '/auth/login')) {
          this.navigationStack = [event.urlAfterRedirects];
          console.log('Cleared navigation stack after login to dashboard:', [...this.navigationStack]);
          return;
        }
        
        // Prevent duplicates in navigation stack (consecutive duplicates)
        if (this.navigationStack.length === 0 || 
            this.navigationStack[this.navigationStack.length - 1] !== event.urlAfterRedirects) {
          this.navigationStack.push(event.urlAfterRedirects);
          
          // Keep stack at a reasonable size
          if (this.navigationStack.length > 10) {
            this.navigationStack.shift();
          }
          
          console.log('Navigation stack updated:', [...this.navigationStack]);
        } else {
          console.log('Duplicate navigation - not updating stack');
        }
      }
    });
  }
  
  private handleExit() {
    if (this.isExitApp) {
      // If already trying to exit, allow it
      console.log('Second back press received, exiting app');
      if (Capacitor.isNativePlatform()) {
        App.exitApp();
      }
    } else {
      this.isExitApp = true;
      this.showExitToast();
      
      // Reset exit flag after the time period
      setTimeout(() => {
        console.log('Exit flag timeout - resetting');
        this.isExitApp = false;
      }, this.timePeriodToExit);
    }
  }
  
  private async showExitToast() {
    try {
      // First, close any existing toasts to avoid UI clutter
      await this.toastController.dismiss();
      
      // Show a better styled toast with clear exit option
      const toast = await this.toastController.create({
        message: 'Exit Travel Plan?',
        duration: this.timePeriodToExit,
        position: 'bottom',
        cssClass: 'exit-toast',
        buttons: [
          {
            text: 'Stay',
            role: 'cancel',
            handler: () => {
              console.log('User chose to stay in app');
              this.isExitApp = false;
            }
          },
          {
            text: 'Exit',
            handler: () => {
              console.log('User chose to exit app via button');
              if (Capacitor.isNativePlatform()) {
                App.exitApp();
              }
            }
          }
        ]
      });
      
      await toast.present();
      console.log('Exit toast presented');
    } catch (err) {
      console.error('Error showing exit toast:', err);
      // Fallback exit method if toast fails
      if (this.isExitApp && Capacitor.isNativePlatform()) {
        App.exitApp();
      }
    }
  }
  
  private handleAppState() {
    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', ({ isActive }) => {
        // When app becomes active (reopened)
        if (isActive) {
          this.ngZone.run(() => {
            // Check if user session is valid
            const currentUser = this.authService.currentUserValue;
            
            // If we have a user, make sure we're on a valid route
            if (currentUser) {
              const currentUrl = this.router.url;
              
              // If current URL is empty or login page but we have a user,
              // redirect to the appropriate dashboard
              if (currentUrl === '' || currentUrl === '/' || currentUrl === '/login') {
                const route = currentUser.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard';
                this.router.navigateByUrl(route);
              }
            }
          });
        }
      });
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
      const pending = await LocalNotifications.getPending();
      await LocalNotifications.cancel({ notifications: pending.notifications });
      
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
