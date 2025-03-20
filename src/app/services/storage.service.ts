import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Set data
  public async set(key: string, value: any) {
    return this._storage?.set(key, value);
  }

  // Get data
  public async get(key: string) {
    return this._storage?.get(key);
  }

  // Remove data
  public async remove(key: string) {
    return this._storage?.remove(key);
  }

  // Clear all data
  public async clear() {
    return this._storage?.clear();
  }

  // Get all keys
  public async keys() {
    return this._storage?.keys();
  }

  // Get length
  public async length() {
    return this._storage?.length();
  }
}
