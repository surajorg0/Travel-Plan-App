import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular/standalone';

declare let FingerprintAIO: any;

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  private fingerprintPluginAvailable = false;
  
  constructor(private platform: Platform) {
    // Initialize on service creation
    this.initializePlugin();
  }

  private async initializePlugin() {
    try {
      // Wait for platform to be ready
      await this.platform.ready();
      
      // Only initialize on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('Biometric auth is only available on native platforms');
        return;
      }
      
      // Check if the plugin is defined
      if (typeof FingerprintAIO !== 'undefined') {
        console.log('FingerprintAIO plugin is available');
        this.fingerprintPluginAvailable = true;
      } else {
        console.warn('FingerprintAIO plugin is not available');
      }
    } catch (error) {
      console.error('Error initializing biometric plugin:', error);
    }
  }

  /**
   * Check if fingerprint authentication is available on the device
   */
  async isAvailable(): Promise<boolean> {
    try {
      // If not on a native platform or plugin isn't available, return false
      if (!Capacitor.isNativePlatform()) {
        console.log('Biometric auth is only available on native platforms');
        return false;
      }
      
      if (!this.fingerprintPluginAvailable) {
        await this.initializePlugin(); // Try to initialize again
        
        if (!this.fingerprintPluginAvailable) {
          console.warn('FingerprintAIO plugin is still not available');
          return false;
        }
      }
      
      // Check if the device has fingerprint capability
      const result = await FingerprintAIO.isAvailable();
      console.log('Fingerprint availability result:', result);
      return !!result;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Show fingerprint authentication dialog
   */
  async authenticate(title: string = 'Fingerprint Authentication', subtitle: string = 'Use your fingerprint to quickly log in'): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Biometric auth is only available on native platforms');
        return false;
      }
      
      if (!this.fingerprintPluginAvailable) {
        const isAvailable = await this.isAvailable();
        if (!isAvailable) {
          return false;
        }
      }
      
      console.log('Showing fingerprint dialog');
      const result = await FingerprintAIO.show({
        title: title,
        subtitle: subtitle,
        description: 'Scan your fingerprint to continue',
        fallbackButtonTitle: 'Use Password',
        disableBackup: false
      });
      
      console.log('Fingerprint authentication result:', result);
      return result.withFingerprint || result.withBiometric || false;
    } catch (error) {
      // If user cancels, don't treat as error
      if (error && typeof error === 'object' && 'code' in error && error.code === -102) {
        console.log('User cancelled fingerprint authentication');
        return false;
      }
      
      console.error('Error during biometric authentication:', error);
      return false;
    }
  }
} 