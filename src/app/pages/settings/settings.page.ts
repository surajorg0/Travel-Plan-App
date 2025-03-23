import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  moonOutline,
  sunnyOutline,
  contrastOutline,
  globeOutline,
  brushOutline,
  notificationsOutline,
  volumeHighOutline,
  lockClosedOutline,
  eyeOutline,
  helpCircleOutline,
  saveOutline,
  refreshOutline
} from 'ionicons/icons';
import { AuthService, User } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  sounds: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonButton,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle
  ]
})
export class SettingsPage implements OnInit {
  user: User | null = null;
  isSaving = false;
  
  settings: AppSettings = {
    theme: 'light',
    language: 'en',
    notifications: true,
    sounds: true,
    fontSize: 'medium'
  };
  
  availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ar', name: 'Arabic' }
  ];
  
  fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];
  
  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private renderer: Renderer2
  ) {
    addIcons({
      moonOutline,
      sunnyOutline,
      contrastOutline,
      globeOutline,
      brushOutline,
      notificationsOutline,
      volumeHighOutline,
      lockClosedOutline,
      eyeOutline,
      helpCircleOutline,
      saveOutline,
      refreshOutline
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
    
    // Load saved settings
    await this.loadSettings();
  }
  
  async loadSettings() {
    try {
      const savedSettings = await this.storageService.get('appSettings');
      if (savedSettings) {
        this.settings = {...this.settings, ...savedSettings};
      }
      
      // Apply current theme
      this.applyTheme(this.settings.theme);
      
      // Apply font size
      this.applyFontSize(this.settings.fontSize);
      
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  
  async saveSettings() {
    this.isSaving = true;
    
    try {
      // Save settings to storage
      await this.storageService.set('appSettings', this.settings);
      
      // Apply settings
      this.applyTheme(this.settings.theme);
      this.applyFontSize(this.settings.fontSize);
      
      const toast = await this.toastController.create({
        message: 'Settings saved successfully',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      
    } catch (error) {
      console.error('Error saving settings:', error);
      const toast = await this.toastController.create({
        message: 'Failed to save settings',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isSaving = false;
    }
  }
  
  applyTheme(theme: 'light' | 'dark' | 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Determine the actual theme based on settings and system preferences
    let appliedTheme = theme;
    if (theme === 'system') {
      appliedTheme = prefersDark.matches ? 'dark' : 'light';
    }
    
    // Apply the theme to the document
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(appliedTheme === 'dark' ? 'dark-theme' : 'light-theme');
    
    // Add a listener for system theme changes if using system setting
    if (theme === 'system') {
      prefersDark.addEventListener('change', (mediaQuery) => {
        const updatedTheme = mediaQuery.matches ? 'dark' : 'light';
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(updatedTheme === 'dark' ? 'dark-theme' : 'light-theme');
      });
    }
  }
  
  applyFontSize(size: 'small' | 'medium' | 'large') {
    document.documentElement.style.setProperty('--font-size-multiplier', 
      size === 'small' ? '0.9' : size === 'large' ? '1.1' : '1');
  }
  
  async resetSettings() {
    const alert = await this.alertController.create({
      header: 'Reset Settings',
      message: 'Are you sure you want to reset all settings to default?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          handler: async () => {
            // Reset to defaults
            this.settings = {
              theme: 'light',
              language: 'en',
              notifications: true,
              sounds: true,
              fontSize: 'medium'
            };
            
            // Save and apply new settings
            await this.saveSettings();
            
            const toast = await this.toastController.create({
              message: 'Settings reset to default',
              duration: 2000,
              position: 'bottom',
              color: 'primary'
            });
            await toast.present();
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  getThemeIcon(theme: string): string {
    switch (theme) {
      case 'dark': return 'moon-outline';
      case 'light': return 'sunny-outline';
      default: return 'contrast-outline';
    }
  }
  
  getLanguageName(code: string): string {
    const language = this.availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  }
  
  // In a real app, these would actually be implemented
  async clearCache() {
    const toast = await this.toastController.create({
      message: 'Cache cleared successfully',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }
  
  async sendFeedback() {
    const alert = await this.alertController.create({
      header: 'Send Feedback',
      inputs: [
        {
          name: 'feedback',
          type: 'textarea',
          placeholder: 'Your feedback about the app...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: async (data) => {
            if (data.feedback) {
              // In a real app, send the feedback to a server
              const toast = await this.toastController.create({
                message: 'Thank you for your feedback!',
                duration: 2000,
                position: 'bottom',
                color: 'success'
              });
              await toast.present();
            }
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  async showAbout() {
    const alert = await this.alertController.create({
      header: 'About Travel Plan App',
      message: `
        <div style="text-align: center;">
          <h4>Version 1.0.0</h4>
          <p>This app was developed to help employees manage their travel plans and documentation.</p>
          <p>&copy; 2025 Company Name</p>
        </div>
      `,
      buttons: ['OK']
    });
    
    await alert.present();
  }
} 