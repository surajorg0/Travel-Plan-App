import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { StorageService } from './storage.service';

export interface StayBackRequest {
  id: string;
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'approved' | 'rejected' | 'pending';
  rejectionReason?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StayBackService {
  private apiUrl = 'http://localhost:3000/api/stay-back'; // Will be used when backend is ready
  private requests: BehaviorSubject<StayBackRequest[]> = new BehaviorSubject<StayBackRequest[]>([]);
  public requests$ = this.requests.asObservable();
  
  // Sample data for testing
  private sampleRequests: StayBackRequest[] = [
    {
      id: '1',
      userId: 'user1',
      destination: 'Paris, France',
      startDate: new Date('2023-12-15'),
      endDate: new Date('2023-12-20'),
      reason: 'I would like to stay a few extra days to explore the city after the business conference.',
      status: 'approved',
      createdAt: new Date('2023-11-01')
    },
    {
      id: '2',
      userId: 'user1',
      destination: 'Tokyo, Japan',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-15'),
      reason: 'After the tech summit, I want to visit some cultural sites in Tokyo.',
      status: 'pending',
      createdAt: new Date('2023-11-15')
    },
    {
      id: '3',
      userId: 'user1',
      destination: 'New York, USA',
      startDate: new Date('2023-11-05'),
      endDate: new Date('2023-11-08'),
      reason: 'Extended stay to meet with potential clients in the area.',
      status: 'rejected',
      rejectionReason: 'Insufficient business justification for extended stay.',
      createdAt: new Date('2023-10-10')
    },
    {
      id: '4',
      userId: 'user1',
      destination: 'Sydney, Australia',
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-03-25'),
      reason: 'I would like to stay for the weekend to visit family members living in Sydney.',
      status: 'approved',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '5',
      userId: 'user1',
      destination: 'Dubai, UAE',
      startDate: new Date('2024-02-05'),
      endDate: new Date('2024-02-08'),
      reason: 'After the trade show, I want to explore local business opportunities.',
      status: 'pending',
      createdAt: new Date('2024-01-20')
    }
  ];
  
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.loadRequests();
  }
  
  // Method to get user stay-back requests
  getUserRequests(userId: string): Observable<StayBackRequest[]> {
    // In the future, this will make an API call
    // For now, filter the sample requests by userId or return all if no requests are loaded
    const currentRequests = this.requests.value;
    if (currentRequests.length === 0) {
      // For demo purposes, assign all sample requests to this user
      const userRequests = this.sampleRequests.map(req => ({
        ...req,
        userId
      }));
      return of(userRequests);
    }
    
    return of(currentRequests.filter(req => req.userId === userId));
  }
  
  // Method to get all stay-back requests (admin only)
  getAllRequests(): Observable<StayBackRequest[]> {
    // In the future, this will make an API call
    return this.requests$;
  }
  
  // Method to create a new stay-back request
  async createRequest(requestData: Partial<StayBackRequest>): Promise<StayBackRequest> {
    try {
      // Generate a unique ID and ensure required fields
      const newRequest: StayBackRequest = {
        id: 'req_' + Date.now(),
        userId: requestData.userId || '',
        destination: requestData.destination || '',
        startDate: requestData.startDate || new Date(),
        endDate: requestData.endDate || new Date(),
        reason: requestData.reason || '',
        status: 'pending', // All new requests are pending
        createdAt: new Date()
      };
      
      // In the future, this will make an API call
      // For now, we'll store it locally
      const currentRequests = this.requests.value;
      this.requests.next([newRequest, ...currentRequests]);
      
      // Store in local storage
      await this.saveRequests();
      
      return newRequest;
    } catch (error) {
      console.error('Error creating stay-back request:', error);
      throw error;
    }
  }
  
  // Method to approve a request (admin only)
  async approveRequest(requestId: string): Promise<boolean> {
    try {
      const requests = this.requests.value;
      const requestIndex = requests.findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) return false;
      
      requests[requestIndex].status = 'approved';
      requests[requestIndex].rejectionReason = undefined;
      
      this.requests.next(requests);
      await this.saveRequests();
      
      return true;
    } catch (error) {
      console.error('Error approving request:', error);
      return false;
    }
  }
  
  // Method to reject a request (admin only)
  async rejectRequest(requestId: string, reason: string): Promise<boolean> {
    try {
      const requests = this.requests.value;
      const requestIndex = requests.findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) return false;
      
      requests[requestIndex].status = 'rejected';
      requests[requestIndex].rejectionReason = reason;
      
      this.requests.next(requests);
      await this.saveRequests();
      
      return true;
    } catch (error) {
      console.error('Error rejecting request:', error);
      return false;
    }
  }
  
  // Method to delete a request
  async deleteRequest(requestId: string): Promise<boolean> {
    try {
      const requests = this.requests.value.filter(r => r.id !== requestId);
      this.requests.next(requests);
      await this.saveRequests();
      
      return true;
    } catch (error) {
      console.error('Error deleting request:', error);
      return false;
    }
  }
  
  // Private methods for local storage (will be replaced with API calls in the future)
  private async loadRequests() {
    try {
      const storedRequests = await this.storageService.get('stay-back-requests');
      if (storedRequests && storedRequests.length > 0) {
        // Convert string dates back to Date objects
        const requests = storedRequests.map((req: any) => ({
          ...req,
          startDate: new Date(req.startDate),
          endDate: new Date(req.endDate),
          createdAt: new Date(req.createdAt)
        }));
        this.requests.next(requests);
      } else {
        // Initialize with sample data if no stored requests
        this.requests.next(this.sampleRequests);
        await this.saveRequests();
      }
    } catch (error) {
      console.error('Error loading requests from storage:', error);
      // Initialize with sample data if error
      this.requests.next(this.sampleRequests);
      await this.saveRequests();
    }
  }
  
  private async saveRequests() {
    try {
      await this.storageService.set('stay-back-requests', this.requests.value);
    } catch (error) {
      console.error('Error saving requests to storage:', error);
    }
  }
}
