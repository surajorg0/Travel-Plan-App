import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private cache: Map<string, any> = new Map();
  
  constructor() {
    // Initialize the cache
    this.initCache();
  }
  
  private async initCache() {
    // Load frequently accessed data into memory
    try {
      // Pre-cache theme and settings to avoid flash of incorrect theme
      const appSettings = await this.get('appSettings');
      if (appSettings) {
        this.cache.set('appSettings', appSettings);
      }
      
      // Pre-cache user data
      const currentUser = await this.get('currentUser');
      if (currentUser) {
        this.cache.set('currentUser', currentUser);
      }
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }
  
  /**
   * Get a value from storage
   * First checks the in-memory cache before accessing device storage
   */
  async get(key: string): Promise<any> {
    try {
      // First check the cache
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      
      // If not in cache, get from storage
      const { value } = await Preferences.get({ key });
      if (value) {
        const parsedValue = JSON.parse(value);
        // Cache the value for future access
        this.cache.set(key, parsedValue);
        return parsedValue;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  }
  
  /**
   * Set a value in storage
   * Updates both the cache and device storage
   */
  async set(key: string, value: any): Promise<void> {
    try {
      // Update the cache first for immediate access
      this.cache.set(key, value);
      
      // Then update persistent storage
      await Preferences.set({
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      throw error;
    }
  }
  
  /**
   * Remove a value from storage
   * Removes from both cache and device storage
   */
  async remove(key: string): Promise<void> {
    try {
      // Remove from cache
      this.cache.delete(key);
      
      // Remove from storage
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all storage
   * Clears both cache and device storage
   */
  async clear(): Promise<void> {
    try {
      // Clear cache
      this.cache.clear();
      
      // Clear storage
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get all keys in storage
   * 
   * @returns Array of stored keys
   */
  async keys(): Promise<string[]> {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }
}
