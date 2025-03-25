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

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
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
      
      // Apply settings immediately
      this.applyTheme(this.settings.theme);
      this.applyFontSize(this.settings.fontSize);
      this.applyLanguage(this.settings.language);
      
      const toast = await this.toastController.create({
        message: this.getLocalizedText('Settings saved successfully', this.settings.language),
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      
    } catch (error) {
      console.error('Error saving settings:', error);
      const toast = await this.toastController.create({
        message: this.getLocalizedText('Failed to save settings', this.settings.language),
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
    
    // Set data-theme attribute for Ionic components
    document.documentElement.setAttribute('data-theme', appliedTheme === 'dark' ? 'dark' : 'light');
    
    // Store the current theme for immediate use
    if (window.localStorage) {
      window.localStorage.setItem('theme', appliedTheme);
    }
    
    // Add a listener for system theme changes if using system setting
    if (theme === 'system') {
      prefersDark.addEventListener('change', (mediaQuery) => {
        const updatedTheme = mediaQuery.matches ? 'dark' : 'light';
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(updatedTheme === 'dark' ? 'dark-theme' : 'light-theme');
        document.documentElement.setAttribute('data-theme', updatedTheme === 'dark' ? 'dark' : 'light');
      });
    }
  }
  
  applyFontSize(size: 'small' | 'medium' | 'large') {
    const sizeValue = size === 'small' ? '0.9' : size === 'large' ? '1.1' : '1';
    document.documentElement.style.setProperty('--font-size-multiplier', sizeValue);
    
    // Force re-render of components by adding/removing a class
    document.body.classList.add('font-size-changed');
    setTimeout(() => {
      document.body.classList.remove('font-size-changed');
    }, 50);
  }

  applyLanguage(language: string) {
    // Apply language changes
    document.documentElement.setAttribute('lang', language);
    
    // Update all text elements with the new language
    this.updatePageText();
  }
  
  // Change handlers to apply settings immediately
  onThemeChange() {
    this.applyTheme(this.settings.theme);
  }
  
  onFontSizeChange() {
    this.applyFontSize(this.settings.fontSize);
  }
  
  onLanguageChange() {
    this.applyLanguage(this.settings.language);
  }
  
  onNotificationChange() {
    // Save notification setting immediately so it's available to app component
    this.storageService.set('appSettings', this.settings).catch(error => {
      console.error('Error saving notification settings:', error);
    });
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
  
  updatePageText() {
    // Update page elements based on selected language
    const headerTitle = document.querySelector('ion-title');
    if (headerTitle) {
      headerTitle.textContent = this.getLocalizedText('Settings', this.settings.language);
    }
    
    // Update other text elements
    this.updateElementText('.settings-intro h2', 'App Settings');
    this.updateElementText('.settings-intro p', 'Customize your app experience');
    this.updateElementText('ion-card-title:nth-of-type(1)', 'Appearance');
    this.updateElementText('ion-card-title:nth-of-type(2)', 'Language');
    this.updateElementText('ion-card-title:nth-of-type(3)', 'Notifications');
    this.updateElementText('ion-card-title:nth-of-type(4)', 'Additional Options');
  }
  
  updateElementText(selector: string, defaultText: string) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = this.getLocalizedText(defaultText, this.settings.language);
    }
  }
  
  getLocalizedText(text: string, language: string): string {
    // Simple translation dictionary
    const translations: {[key: string]: {[key: string]: string}} = {
      'Settings': {
        'en': 'Settings',
        'hi': 'सेटिंग्स'
      },
      'App Settings': {
        'en': 'App Settings',
        'hi': 'ऐप सेटिंग्स'
      },
      'Customize your app experience': {
        'en': 'Customize your app experience',
        'hi': 'अपने ऐप अनुभव को अनुकूलित करें'
      },
      'Appearance': {
        'en': 'Appearance',
        'hi': 'उपस्थिति'
      },
      'Language': {
        'en': 'Language',
        'hi': 'भाषा'
      },
      'Notifications': {
        'en': 'Notifications',
        'hi': 'सूचनाएं'
      },
      'Additional Options': {
        'en': 'Additional Options',
        'hi': 'अतिरिक्त विकल्प'
      },
      'Theme': {
        'en': 'Theme',
        'hi': 'थीम'
      },
      'Font Size': {
        'en': 'Font Size',
        'hi': 'फ़ॉन्ट आकार'
      },
      'Light': {
        'en': 'Light',
        'hi': 'हल्का'
      },
      'Dark': {
        'en': 'Dark',
        'hi': 'गहरा'
      },
      'System Default': {
        'en': 'System Default',
        'hi': 'सिस्टम डिफ़ॉल्ट'
      },
      'Small': {
        'en': 'Small',
        'hi': 'छोटा'
      },
      'Medium': {
        'en': 'Medium',
        'hi': 'मध्यम'
      },
      'Large': {
        'en': 'Large',
        'hi': 'बड़ा'
      },
      'App Language': {
        'en': 'App Language',
        'hi': 'ऐप भाषा'
      },
      'Sound Effects': {
        'en': 'Sound Effects',
        'hi': 'ध्वनि प्रभाव'
      },
      'Clear App Cache': {
        'en': 'Clear App Cache',
        'hi': 'ऐप कैश साफ़ करें'
      },
      'Send Feedback': {
        'en': 'Send Feedback',
        'hi': 'प्रतिक्रिया भेजें'
      },
      'About App': {
        'en': 'About App',
        'hi': 'ऐप के बारे में'
      },
      'Save Settings': {
        'en': 'Save Settings',
        'hi': 'सेटिंग्स सहेजें'
      },
      'Settings saved successfully': {
        'en': 'Settings saved successfully',
        'hi': 'सेटिंग्स सफलतापूर्वक सहेजी गईं'
      },
      'Failed to save settings': {
        'en': 'Failed to save settings',
        'hi': 'सेटिंग्स सहेजने में विफल'
      },
      'Home': {
        'en': 'Home',
        'hi': 'होम'
      },
      'Docs': {
        'en': 'Docs',
        'hi': 'दस्तावेज़'
      },
      'Photos': {
        'en': 'Photos',
        'hi': 'फोटो'
      },
      'Game': {
        'en': 'Game',
        'hi': 'गेम'
      },
      'Profile': {
        'en': 'Profile',
        'hi': 'प्रोफाइल'
      }
    };
    
    // Return translation or fallback to English or the original text
    return translations[text]?.[language] || translations[text]?.['en'] || text;
  }
} 