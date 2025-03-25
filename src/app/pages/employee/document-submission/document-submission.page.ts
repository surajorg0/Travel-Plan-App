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
import { Router } from '@angular/router';
import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

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

// Document interface
interface Document {
  id: string;
  userId: string;
  documentType: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  submissionDate: Date;
  expiryDate?: Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Revision';
  adminFeedback?: string;
}

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
      // Simulate API upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a new document object
      const newDocument: Document = {
        id: 'doc_' + Date.now().toString(),
        userId: this.userId,
        documentType: this.documentForm.get('documentType')?.value,
        title: this.documentForm.get('title')?.value,
        description: this.documentForm.get('description')?.value,
        fileName: this.selectedFile.name,
        fileUrl: URL.createObjectURL(this.selectedFile), // For demo purposes only
        fileSize: this.selectedFile.size,
        submissionDate: new Date(),
        expiryDate: this.documentForm.get('expiryDate')?.value,
        status: 'Pending'
      };

      // In a real app, you would call your service to upload the file to a server
      // For now, we'll just add it to our local array
      this.submittedDocuments.unshift(newDocument);
      
      // Save to localStorage for persistence
      this.saveDocumentsToStorage();

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
    // In a real app, you would fetch documents from a server
    // For this demo, we'll use localStorage
    const storedDocs = localStorage.getItem(`travel-plan-app-documents-${this.userId}`);
    if (storedDocs) {
      try {
        const parsedDocs = JSON.parse(storedDocs);
        this.submittedDocuments = parsedDocs.map((doc: any) => ({
          ...doc,
          submissionDate: new Date(doc.submissionDate),
          expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined
        }));
      } catch (error) {
        console.error('Error parsing stored documents:', error);
      }
    }
  }

  saveDocumentsToStorage() {
    localStorage.setItem(`travel-plan-app-documents-${this.userId}`, JSON.stringify(this.submittedDocuments));
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
