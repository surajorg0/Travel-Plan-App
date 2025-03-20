import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular/standalone';

// Declare the global FingerprintAIO object for TypeScript
declare let FingerprintAIO: any;

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  private fingerprintPluginAvailable = false;
  private initializationAttempted = false;
  
  constructor(private platform: Platform) {
    console.log('BiometricService constructor called');
    // Delay initialization to ensure Capacitor is ready
    setTimeout(() => {
      this.initializePlugin();
    }, 1000);
  }

  private async initializePlugin() {
    try {
      console.log('Initializing biometric plugin...');
      this.initializationAttempted = true;
      
      // Wait for platform to be ready
      await this.platform.ready();
      console.log('Platform is ready');
      
      // Only initialize on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('Not a native platform, biometric auth unavailable');
        return;
      }
      
      console.log('Checking if FingerprintAIO is defined...');
      // Check if the plugin is defined
      if (typeof FingerprintAIO !== 'undefined') {
        console.log('✓ FingerprintAIO plugin is available');
        this.fingerprintPluginAvailable = true;
        
        // Try to call isAvailable() to verify plugin is working
        try {
          const result = await FingerprintAIO.isAvailable();
          console.log('Initial availability check:', result);
        } catch (e) {
          console.error('Error during initial availability check:', e);
        }
      } else {
        console.warn('✗ FingerprintAIO plugin is not available');
      }
    } catch (error) {
      console.error('Error initializing biometric plugin:', error);
    }
  }

  /**
   * Check if fingerprint authentication is available on the device
   */
  async isAvailable(): Promise<boolean> {
    console.log('isAvailable() called');
    
    try {
      // If not on a native platform, return false
      if (!Capacitor.isNativePlatform()) {
        console.log('Not a native platform, fingerprint unavailable');
        return false;
      }
      
      // If initialization hasn't been attempted or failed, try again
      if (!this.initializationAttempted || !this.fingerprintPluginAvailable) {
        console.log('Plugin not initialized, attempting initialization');
        await this.initializePlugin();
      }
      
      if (!this.fingerprintPluginAvailable) {
        console.warn('FingerprintAIO plugin is still not available after initialization attempt');
        return false;
      }
      
      // Check if device has fingerprint capability
      console.log('Checking device fingerprint capability...');
      const result = await FingerprintAIO.isAvailable();
      console.log('Fingerprint availability result:', result);
      
      // The result might be a boolean or a string like "finger" or "face"
      return !!result;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      // Provide more details about the error
      if (error && typeof error === 'object') {
        console.error('Error code:', (error as any).code);
        console.error('Error message:', (error as any).message);
      }
      return false;
    }
  }

  /**
   * Show fingerprint authentication dialog
   */
  async authenticate(title: string = 'Fingerprint Authentication', subtitle: string = 'Use your fingerprint to quickly log in'): Promise<boolean> {
    console.log('authenticate() called');
    
    try {
      // If not on a native platform, return false
      if (!Capacitor.isNativePlatform()) {
        console.log('Not a native platform, fingerprint auth skipped');
        return false;
      }
      
      // Check if fingerprint is available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        console.log('Fingerprint is not available on this device');
        return false;
      }
      
      console.log('Showing fingerprint dialog with options:', {
        title,
        subtitle,
        description: 'Scan your fingerprint to continue'
      });
      
      const result = await FingerprintAIO.show({
        title: title,
        subtitle: subtitle,
        description: 'Scan your fingerprint to continue',
        fallbackButtonTitle: 'Use Password',
        disableBackup: false
      });
      
      console.log('Fingerprint authentication successful:', result);
      return true;
    } catch (error) {
      // If user cancels, don't treat as error
      if (error && typeof error === 'object' && 'code' in error) {
        if ((error as any).code === -102) {
          console.log('User cancelled fingerprint authentication');
          return false;
        }
        
        console.error('Fingerprint error code:', (error as any).code);
        console.error('Fingerprint error message:', (error as any).message);
      } else {
        console.error('Unknown error during biometric authentication:', error);
      }
      
      return false;
    }
  }
} 