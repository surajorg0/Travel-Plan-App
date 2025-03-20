import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

declare let FingerprintAIO: any;

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  
  constructor() { }

  /**
   * Check if fingerprint authentication is available on the device
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Biometric auth is only available on native platforms');
        return false;
      }
      
      const result = await FingerprintAIO.isAvailable();
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
      
      const result = await FingerprintAIO.show({
        title: title,
        subtitle: subtitle,
        description: 'Scan your fingerprint to continue',
        fallbackButtonTitle: 'Use Password',
        disableBackup: false
      });
      
      return result.withFingerprint || result.withBiometric || false;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  }
} 