import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /**
   * Store a value with the given key
   * 
   * @param key The key to store the value under
   * @param value The value to store
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await Preferences.set({
        key: key,
        value: jsonValue
      });
      console.log(`Successfully stored ${key}`);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a stored value by key
   * 
   * @param key The key to retrieve
   * @returns The stored value, or null if not found
   */
  async get(key: string): Promise<any> {
    try {
      const result = await Preferences.get({ key });
      if (result && result.value) {
        try {
          return JSON.parse(result.value);
        } catch (e) {
          // If the value is not valid JSON, return the raw value
          return result.value;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a stored value by key
   * 
   * @param key The key to remove
   */
  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
      console.log(`Successfully removed ${key}`);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all stored values
   */
  async clear(): Promise<void> {
    try {
      await Preferences.clear();
      console.log('Successfully cleared all storage');
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
