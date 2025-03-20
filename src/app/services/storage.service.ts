import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _initPromise: Promise<Storage> | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    if (this._initPromise) {
      return this._initPromise;
    }

    console.log('Initializing storage...');
    this._initPromise = this.storage.create()
      .then(storage => {
        console.log('Storage initialized successfully');
        this._storage = storage;
        return storage;
      })
      .catch(error => {
        console.error('Error initializing storage:', error);
        throw error;
      });

    return this._initPromise;
  }

  // Ensure storage is initialized before any operation
  private async ensureStorage(): Promise<Storage> {
    if (!this._storage) {
      console.log('Storage not initialized, initializing now...');
      return this.init();
    }
    return this._storage;
  }

  // Set data
  public async set(key: string, value: any): Promise<any> {
    try {
      const storage = await this.ensureStorage();
      console.log(`Setting storage key: ${key}`);
      return storage.set(key, value);
    } catch (error) {
      console.error(`Error setting storage key ${key}:`, error);
      throw error;
    }
  }

  // Get data
  public async get(key: string): Promise<any> {
    try {
      const storage = await this.ensureStorage();
      const value = await storage.get(key);
      console.log(`Retrieved storage key: ${key}, has value: ${!!value}`);
      return value;
    } catch (error) {
      console.error(`Error getting storage key ${key}:`, error);
      return null;
    }
  }

  // Remove data
  public async remove(key: string): Promise<any> {
    try {
      const storage = await this.ensureStorage();
      console.log(`Removing storage key: ${key}`);
      return storage.remove(key);
    } catch (error) {
      console.error(`Error removing storage key ${key}:`, error);
      throw error;
    }
  }

  // Clear all data
  public async clear(): Promise<void> {
    try {
      const storage = await this.ensureStorage();
      console.log('Clearing all storage');
      return storage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Get all keys
  public async keys(): Promise<string[]> {
    try {
      const storage = await this.ensureStorage();
      return storage.keys();
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }

  // Get length
  public async length(): Promise<number> {
    try {
      const storage = await this.ensureStorage();
      return storage.length();
    } catch (error) {
      console.error('Error getting storage length:', error);
      return 0;
    }
  }
}
