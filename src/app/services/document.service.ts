import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

export interface Document {
  _id?: string;
  id?: string;
  user?: string;
  userId?: string;
  title: string;
  description?: string;
  documentType: string;
  documentFile?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  expiryDate?: Date;
  isVerified?: boolean;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Needs Revision';
  verifiedBy?: string;
  verificationDate?: Date;
  verificationComments?: string;
  submissionDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:3000/api/documents';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  // Get auth headers with token
  private getAuthHeaders(): HttpHeaders {
    const token = this.storageService.get('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Upload a new document
  uploadDocument(documentData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(this.apiUrl, documentData, { headers });
  }

  // Get all documents (admin only)
  getAllDocuments(): Observable<Document[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Document[]>(this.apiUrl, { headers });
  }

  // Get current user's documents
  getUserDocuments(): Observable<Document[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Document[]>(`${this.apiUrl}/me`, { headers });
  }

  // Get document by ID
  getDocumentById(id: string): Observable<Document> {
    const headers = this.getAuthHeaders();
    return this.http.get<Document>(`${this.apiUrl}/${id}`, { headers });
  }

  // Update document status (admin only)
  updateDocumentStatus(id: string, status: string, comments?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/${id}/status`, { status, comments }, { headers });
  }

  // Delete document
  deleteDocument(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  // Fallback method for local storage when API is not available
  async saveDocumentLocally(document: Document, file: File): Promise<Document> {
    try {
      // Get current user ID
      const currentUser = await this.storageService.get('currentUser');
      const userId = currentUser?.id || 'unknown';
      
      // Create document object
      const newDocument: Document = {
        id: 'doc_' + Date.now().toString(),
        userId: userId,
        title: document.title,
        description: document.description,
        documentType: document.documentType,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file), // For demo purposes only
        submissionDate: new Date(),
        expiryDate: document.expiryDate,
        status: 'Pending'
      };

      // Get existing documents from storage
      const storedDocs = await this.storageService.get(`travel-plan-app-documents-${userId}`) || [];
      
      // Add new document to array
      storedDocs.unshift(newDocument);
      
      // Save updated array back to storage
      await this.storageService.set(`travel-plan-app-documents-${userId}`, storedDocs);
      
      return newDocument;
    } catch (error) {
      console.error('Error saving document locally:', error);
      throw error;
    }
  }

  // Get documents from local storage
  async getDocumentsFromStorage(userId: string): Promise<Document[]> {
    try {
      const storedDocs = await this.storageService.get(`travel-plan-app-documents-${userId}`);
      return storedDocs || [];
    } catch (error) {
      console.error('Error getting documents from storage:', error);
      return [];
    }
  }
}
