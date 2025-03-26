import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  location?: string;
  status: 'approved' | 'rejected' | 'pending';
  rejectionReason?: string;
  uploadDate: Date;
  userId: string;
  likes?: number;
  tags?: string[];
  comments?: { 
    id: string;
    user: string;
    text: string;
    date: Date;
  }[];
  selected?: boolean; // Add this property for selection in admin view
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private apiUrl = 'http://localhost:3000/api/photos'; // Will be used when backend is ready
  private photos: BehaviorSubject<Photo[]> = new BehaviorSubject<Photo[]>([]);
  public photos$ = this.photos.asObservable();
  
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.loadPhotos();
  }
  
  // Method to get user photos
  getUserPhotos(userId: string): Observable<Photo[]> {
    // In the future, this will make an API call
    return of(this.photos.value.filter(photo => photo.userId === userId));
  }
  
  // Method to get all photos
  getAllPhotos(): Observable<Photo[]> {
    // In the future, this will make an API call
    return this.photos$;
  }
  
  // Method to upload a photo
  async uploadPhoto(photoData: Partial<Photo>): Promise<Photo> {
    try {
      // Generate a unique ID and ensure required fields
      const newPhoto: Photo = {
        id: 'photo_' + Date.now(),
        url: photoData.url || '',
        caption: photoData.caption || '',
        location: photoData.location,
        status: 'pending', // All new uploads are pending
        uploadDate: new Date(),
        userId: photoData.userId || '',
        likes: 0,
        tags: photoData.tags || [],
        comments: []
      };
      
      // In the future, this will make an API call
      // For now, we'll store it locally
      const currentPhotos = this.photos.value;
      this.photos.next([newPhoto, ...currentPhotos]);
      
      // Store in local storage
      await this.savePhotos();
      
      return newPhoto;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }
  
  // Method to get a single photo
  getPhotoById(photoId: string): Observable<Photo | undefined> {
    // In the future, this will make an API call
    return of(this.photos.value.find(photo => photo.id === photoId));
  }
  
  // Method to approve a photo (admin only)
  async approvePhoto(photoId: string): Promise<boolean> {
    try {
      const photos = this.photos.value;
      const photoIndex = photos.findIndex(p => p.id === photoId);
      
      if (photoIndex === -1) return false;
      
      photos[photoIndex].status = 'approved';
      photos[photoIndex].rejectionReason = undefined;
      
      this.photos.next(photos);
      await this.savePhotos();
      
      return true;
    } catch (error) {
      console.error('Error approving photo:', error);
      return false;
    }
  }
  
  // Method to reject a photo (admin only)
  async rejectPhoto(photoId: string, reason: string): Promise<boolean> {
    try {
      const photos = this.photos.value;
      const photoIndex = photos.findIndex(p => p.id === photoId);
      
      if (photoIndex === -1) return false;
      
      photos[photoIndex].status = 'rejected';
      photos[photoIndex].rejectionReason = reason;
      
      this.photos.next(photos);
      await this.savePhotos();
      
      return true;
    } catch (error) {
      console.error('Error rejecting photo:', error);
      return false;
    }
  }
  
  // Method to delete a photo
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      const photos = this.photos.value.filter(p => p.id !== photoId);
      this.photos.next(photos);
      await this.savePhotos();
      
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }
  
  // Method to like a photo
  async likePhoto(photoId: string): Promise<boolean> {
    try {
      const photos = this.photos.value;
      const photoIndex = photos.findIndex(p => p.id === photoId);
      
      if (photoIndex === -1) return false;
      
      photos[photoIndex].likes = (photos[photoIndex].likes || 0) + 1;
      
      this.photos.next(photos);
      await this.savePhotos();
      
      return true;
    } catch (error) {
      console.error('Error liking photo:', error);
      return false;
    }
  }
  
  // Method to add a comment to a photo
  async addComment(photoId: string, userId: string, text: string): Promise<boolean> {
    try {
      const photos = this.photos.value;
      const photoIndex = photos.findIndex(p => p.id === photoId);
      
      if (photoIndex === -1) return false;
      
      if (!photos[photoIndex].comments) {
        photos[photoIndex].comments = [];
      }
      
      photos[photoIndex].comments!.push({
        id: 'comment_' + Date.now(),
        user: userId,
        text: text,
        date: new Date()
      });
      
      this.photos.next(photos);
      await this.savePhotos();
      
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  }
  
  // Private methods for local storage (will be replaced with API calls in the future)
  private async loadPhotos() {
    try {
      const storedPhotos = await this.storageService.get('photos');
      if (storedPhotos) {
        // Convert string dates back to Date objects
        const photos = storedPhotos.map((photo: any) => ({
          ...photo,
          uploadDate: new Date(photo.uploadDate),
          comments: photo.comments ? photo.comments.map((comment: any) => ({
            ...comment,
            date: new Date(comment.date)
          })) : []
        }));
        this.photos.next(photos);
      }
    } catch (error) {
      console.error('Error loading photos from storage:', error);
    }
  }
  
  private async savePhotos() {
    try {
      await this.storageService.set('photos', this.photos.value);
    } catch (error) {
      console.error('Error saving photos to storage:', error);
    }
  }
}
