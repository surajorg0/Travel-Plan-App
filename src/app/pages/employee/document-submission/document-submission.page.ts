import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular/standalone';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonText,
  IonList,
  IonThumbnail,
  IonBadge,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  helpCircleOutline, 
  cloudUploadOutline, 
  eyeOutline, 
  documentTextOutline 
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';
import { DocumentService, Document } from '../../../services/document.service';
import { Router } from '@angular/router';
import { Directive, HostListener, Output, EventEmitter } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';}

// File Drop Directive
@Directive({
  selector: '[appDragDrop]',
  standalone: true
})
export class DragDropDirective {
  @Output() fileDropped = new EventEmitter<any>();

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target instanceof HTMLElement) {
      event.target.classList.add('dragover');
    }
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target instanceof HTMLElement) {
      event.target.classList.remove('dragover');
    }
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target instanceof HTMLElement) {
      event.target.classList.remove('dragover');
    }
    if (event.dataTransfer?.files.length) {
      this.fileDropped.emit(event.dataTransfer.files);
    }
  }
}

// Using Document interface from DocumentService

@Component({
  selector: 'app-document-submission',
  templateUrl: './document-submission.page.html',
  styleUrls: ['./document-submission.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonText,
    IonList,
    IonThumbnail,
    IonBadge,
    IonSpinner,
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    DragDropDirective
  ]
})
export class DocumentSubmissionPage implements OnInit {
  documentForm: FormGroup;
  selectedFile: File | null = null;
  showHelp = false;
  isSubmitting = false;
  submittedDocuments: Document[] = [];
  userId: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private documentService: DocumentService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({ 
      helpCircleOutline, 
      cloudUploadOutline, 
      eyeOutline, 
      documentTextOutline 
    });

    this.documentForm = this.formBuilder.group({
      documentType: ['', Validators.required],
      otherDocumentType: [''],
      title: ['', Validators.required],
      description: [''],
      file: ['', Validators.required],
      expiryDate: [null]
    });
  }

  ngOnInit() {
    // Check if user is authenticated
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.userId = user.id.toString();
      this.loadDocuments();
    });
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.validateAndSetFile(file);
    }
  }

  onFileDropped(fileList: FileList) {
    if (fileList.length > 0) {
      const file = fileList[0];
      this.validateAndSetFile(file);
    }
  }

  validateAndSetFile(file: File) {
    const validFileTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    if (!validFileTypes.includes(file.type)) {
      this.documentForm.get('file')?.setErrors({ invalidFileType: true });
      return;
    }
    
    if (file.size > maxFileSize) {
      this.documentForm.get('file')?.setErrors({ invalidFileSize: true });
      return;
    }
    
    this.selectedFile = file;
    this.documentForm.get('file')?.setValue(file.name);
  }

  formatFileSize(size: number): string {
    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    } else {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
  }

  async submitDocument() {
    if (this.documentForm.invalid || !this.selectedFile) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.documentForm.controls).forEach(key => {
        this.documentForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: 'Uploading document...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      // Create document data
      const documentData = new FormData();
      documentData.append('file', this.selectedFile);
      documentData.append('title', this.documentForm.get('title')?.value);
      documentData.append('documentType', this.documentForm.get('documentType')?.value);
      documentData.append('description', this.documentForm.get('description')?.value || '');
      
      if (this.documentForm.get('expiryDate')?.value) {
        documentData.append('expiryDate', this.documentForm.get('expiryDate')?.value);
      }

      // Try to upload to MongoDB first
      this.documentService.uploadDocument(documentData)
        .pipe(
          catchError(error => {
            console.error('API upload failed, falling back to local storage:', error);
            // If API fails, fall back to local storage
            return of(null);
          })
        )
        .subscribe(async (response) => {
          let newDocument: Document;
          
          if (response) {
            // If API call was successful, use the returned document
            newDocument = response;
            console.log('Document uploaded to MongoDB successfully:', newDocument);
          } else {
            // If API call failed, save locally
            const docData: Document = {
              title: this.documentForm.get('title')?.value,
              documentType: this.documentForm.get('documentType')?.value,
              description: this.documentForm.get('description')?.value,
              expiryDate: this.documentForm.get('expiryDate')?.value
            };
            
            newDocument = await this.documentService.saveDocumentLocally(docData, this.selectedFile);
            console.log('Document saved locally:', newDocument);
          }

          // Add to local array for immediate display
          this.submittedDocuments.unshift(newDocument);
          
          // Reset form and state
          this.documentForm.reset();
          this.selectedFile = null;
          this.isSubmitting = false;
          
          await loading.dismiss();
          
          const toast = await this.toastController.create({
            message: 'Document submitted successfully!',
            duration: 3000,
            position: 'bottom',
            color: 'success'
          });
          await toast.present();
        }, async (error) => {
          this.isSubmitting = false;
          await loading.dismiss();
          
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Failed to submit document. Please try again.',
            buttons: ['OK']
          });
          await alert.present();
          console.error('Error submitting document:', error);
        });
    } catch (error) {
      this.isSubmitting = false;
      await loading.dismiss();
      
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Failed to submit document. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
      console.error('Error submitting document:', error);
    }
  }

  loadDocuments() {
    // Try to get documents from API first
    this.documentService.getUserDocuments()
      .pipe(
        catchError(error => {
          console.error('API fetch failed, falling back to local storage:', error);
          // If API fails, fall back to local storage
          return of([]);
        })
      )
      .subscribe(async (documents) => {
        if (documents && documents.length > 0) {
          // If API call was successful, use the returned documents
          this.submittedDocuments = documents;
          console.log('Documents loaded from MongoDB successfully:', documents);
        } else {
          // If API call failed or returned empty, try local storage
          this.submittedDocuments = await this.documentService.getDocumentsFromStorage(this.userId);
          console.log('Documents loaded from local storage:', this.submittedDocuments);
        }
      }, error => {
        console.error('Error loading documents:', error);
      });
  }

  // This method is no longer needed as we're using the document service
  // Keeping it for backward compatibility
  saveDocumentsToStorage() {
    // This is now handled by the document service
  }

  getDocumentTypeName(type: string): string {
    const typeMap: {[key: string]: string} = {
      'passport': 'Passport',
      'visa': 'Visa',
      'identity': 'ID Card',
      'insurance': 'Travel Insurance',
      'medical': 'Medical Certificate',
      'agreement': 'Travel Agreement',
      'other': 'Other Document'
    };
    
    return typeMap[type] || 'Document';
  }

  getStatusColor(status: string): string {
    const colorMap: {[key: string]: string} = {
      'Pending': 'warning',
      'Approved': 'success',
      'Rejected': 'danger',
      'Needs Revision': 'tertiary'
    };
    
    return colorMap[status] || 'medium';
  }

  async viewDocument(document: Document) {
    // In a real app, you would open the document in a viewer or download it
    // For this demo, we'll show an alert with document details
    const alert = await this.alertController.create({
      header: document.title,
      subHeader: this.getDocumentTypeName(document.documentType),
      message: `
        <p><strong>Status:</strong> ${document.status}</p>
        <p><strong>Submitted:</strong> ${new Date(document.submissionDate).toLocaleDateString()}</p>
        ${document.expiryDate ? `<p><strong>Expires:</strong> ${new Date(document.expiryDate).toLocaleDateString()}</p>` : ''}
        ${document.description ? `<p><strong>Description:</strong> ${document.description}</p>` : ''}
        ${document.adminFeedback ? `<p><strong>Admin Feedback:</strong> ${document.adminFeedback}</p>` : ''}
      `,
      buttons: ['Close']
    });
    
    await alert.present();
  }
}
