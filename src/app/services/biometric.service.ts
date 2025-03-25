import { Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  constructor(private platform: Platform) { }

  /**
   * Check if biometric authentication is available on the device
   * 
   * @returns true if biometric authentication is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Don't check for biometric on web platform
      if (this.platform.is('mobileweb') || this.platform.is('desktop')) {
        console.log('Biometric not available on web/desktop platform');
        // For testing purposes only - in real production this should be false
        return true; // Return true to allow testing fingerprint flow in browser
      }

      // Check hardware and biometric support
      const result = await NativeBiometric.isAvailable();
      
      if (result.isAvailable) {
        console.log('Biometric hardware is available:', result);
        return true;
      } else {
        console.log('Biometric hardware not available:', result);
        return false;
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Authenticate the user using biometric authentication
   * 
   * @param title The title of the authentication dialog
   * @param subtitle The subtitle of the authentication dialog
   * @returns true if authentication was successful
   */
  async authenticate(title: string, subtitle: string): Promise<boolean> {
    try {
      // For web/desktop, simulate successful authentication
      if (this.platform.is('mobileweb') || this.platform.is('desktop')) {
        console.log('Simulating successful biometric auth on web/desktop');
        // Display a mock dialog for testing purposes
        return new Promise<boolean>(resolve => {
          setTimeout(() => {
            console.log('Mock fingerprint authentication successful');
            resolve(true);
          }, 1500); // Simulate a delay of 1.5 seconds
        });
      }
      
      // Check if available first
      const available = await this.isAvailable();
      if (!available) {
        console.log('Biometric authentication not available');
        return false;
      }
      
      // Verify identity
      const result = await NativeBiometric.verifyIdentity({
        title: title || 'Biometric Authentication',
        subtitle: subtitle || 'Verify your identity',
        description: 'Place your finger on the sensor to verify your identity',
        maxAttempts: 3
      });
      
      console.log('Biometric authentication result:', result);
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * Store credentials securely with biometric protection
   * 
   * @param username The username to store
   * @param password The password to store
   * @param server The server name or identifier
   * @returns true if credentials were stored successfully
   */
  async storeCredentials(username: string, password: string, server: string): Promise<boolean> {
    try {
      // For web/desktop, simulate successful storage
      if (this.platform.is('mobileweb') || this.platform.is('desktop')) {
        console.log('Simulating credential storage on web/desktop');
        return true; // For development testing
      }
      
      await NativeBiometric.setCredentials({
        username,
        password,
        server
      });
      
      console.log('Credentials stored successfully for:', username);
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve stored credentials
   * 
   * @param server The server name or identifier
   * @returns The stored credentials or null if not found
   */
  async getCredentials(server: string): Promise<{ username: string, password: string } | null> {
    try {
      // For web/desktop, return simulated credentials
      if (this.platform.is('mobileweb') || this.platform.is('desktop')) {
        console.log('Simulating credential retrieval on web/desktop');
        return { username: 'test@example.com', password: 'password123' }; // For development testing
      }
      
      const credentials = await NativeBiometric.getCredentials({
        server
      });
      
      console.log('Retrieved credentials for:', credentials.username);
      return credentials;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  /**
   * Delete stored credentials
   * 
   * @param server The server name or identifier
   * @returns true if credentials were deleted successfully
   */
  async deleteCredentials(server: string): Promise<boolean> {
    try {
      // For web/desktop, simulate successful deletion
      if (this.platform.is('mobileweb') || this.platform.is('desktop')) {
        console.log('Simulating credential deletion on web/desktop');
        return true; // For development testing
      }
      
      await NativeBiometric.deleteCredentials({
        server
      });
      
      console.log('Credentials deleted successfully for server:', server);
      return true;
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return false;
    }
  }
} 