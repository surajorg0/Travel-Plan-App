import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  AlertController, 
  IonBadge,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle,
  IonCheckbox,
  IonContent, 
  IonHeader, 
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle, 
  IonToolbar,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  alertCircleOutline, 
  airplaneOutline, 
  calendarOutline, 
  helpCircleOutline,
  shieldOutline,
  walletOutline
} from 'ionicons/icons';
import { StorageService } from '../../../services/storage.service';

// Interfaces
interface Trip {
  id: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
}

interface StayBackRequest {
  id: string;
  tripId: string;
  tripDestination: string;
  originalEndDate: Date;
  extraDays: number;
  newEndDate: Date;
  accommodationType: string;
  accommodationAddress: string;
  reason: string;
  emergencyContact: string;
  submissionDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
}

@Component({
  selector: 'app-stay-back-request',
  templateUrl: './stay-back-request.page.html',
  styleUrls: ['./stay-back-request.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonList,
    IonIcon,
    IonBadge,
    IonText,
    IonSpinner
  ]
})
export class StayBackRequestPage implements OnInit {
  requestForm: FormGroup;
  upcomingTrips: Trip[] = [];
  previousRequests: StayBackRequest[] = [];
  selectedTrip: Trip | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private storageService: StorageService
  ) {
    // Add Ionicons
    addIcons({
      'alert-circle-outline': alertCircleOutline,
      'airplane-outline': airplaneOutline,
      'calendar-outline': calendarOutline,
      'help-circle-outline': helpCircleOutline,
      'shield-outline': shieldOutline,
      'wallet-outline': walletOutline
    });

    // Initialize form
    this.requestForm = this.formBuilder.group({
      tripId: ['', Validators.required],
      extraDays: ['', [Validators.required, Validators.min(1), Validators.max(14)]],
      accommodationType: ['', Validators.required],
      accommodationAddress: [''],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      emergencyContact: ['', Validators.required],
      confirmation: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  // Getter for form controls
  get f() {
    return this.requestForm.controls;
  }

  async loadData() {
    this.isLoading = true;
    
    try {
      // Load sample trips data
      // In a real app, this would come from a service
      this.upcomingTrips = this.getSampleTrips();
      
      // Load previous requests
      await this.loadPreviousRequests();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Load previous requests from storage
  async loadPreviousRequests() {
    try {
      const stored = await this.storageService.get('stay-back-requests');
      if (stored) {
        this.previousRequests = JSON.parse(stored);
        
        // Convert date strings to Date objects
        this.previousRequests.forEach(request => {
          request.originalEndDate = new Date(request.originalEndDate);
          request.newEndDate = new Date(request.newEndDate);
          request.submissionDate = new Date(request.submissionDate);
        });
      } else {
        this.previousRequests = this.getSampleRequests();
      }
    } catch (error) {
      console.error('Error loading previous requests:', error);
      this.previousRequests = [];
    }
  }

  // Get sample trips for demonstration
  getSampleTrips(): Trip[] {
    const now = new Date();
    return [
      {
        id: 't1',
        destination: 'New York, USA',
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 12),
        purpose: 'Annual Technology Conference'
      },
      {
        id: 't2',
        destination: 'Singapore',
        startDate: new Date(now.getFullYear(), now.getMonth() + 2, 10),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 15),
        purpose: 'Regional Sales Meeting'
      },
      {
        id: 't3',
        destination: 'London, UK',
        startDate: new Date(now.getFullYear(), now.getMonth() + 3, 8),
        endDate: new Date(now.getFullYear(), now.getMonth() + 3, 18),
        purpose: 'Client Onboarding Workshop'
      }
    ];
  }

  // Get sample requests for demonstration
  getSampleRequests(): StayBackRequest[] {
    return [
      {
        id: 'r1',
        tripId: 'past-trip-1',
        tripDestination: 'Berlin, Germany',
        originalEndDate: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        extraDays: 3,
        newEndDate: new Date(new Date().setMonth(new Date().getMonth() - 2, new Date().getDate() + 3)),
        accommodationType: 'hotel',
        accommodationAddress: 'Radisson Blu Berlin, Karl-Liebknecht-Str. 3',
        reason: 'Would like to explore the city and visit museums',
        emergencyContact: 'Jane Doe, +1-555-1234',
        submissionDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        status: 'Approved'
      },
      {
        id: 'r2',
        tripId: 'past-trip-2',
        tripDestination: 'Tokyo, Japan',
        originalEndDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        extraDays: 5,
        newEndDate: new Date(new Date().setMonth(new Date().getMonth() - 1, new Date().getDate() + 5)),
        accommodationType: 'airbnb',
        accommodationAddress: 'Shibuya District, Tokyo',
        reason: 'Want to experience Japanese culture and visit Mt. Fuji',
        emergencyContact: 'John Smith, +1-555-5678',
        submissionDate: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        status: 'Rejected',
        comments: 'Trip duration already exceeds company policy limits'
      }
    ];
  }

  // Handler when trip selection changes
  onTripChange() {
    const tripId = this.requestForm.get('tripId')?.value;
    if (tripId) {
      this.selectedTrip = this.upcomingTrips.find(trip => trip.id === tripId) || null;
    } else {
      this.selectedTrip = null;
    }
  }

  // Calculate new return date based on extra days
  calculateNewReturnDate(): Date | null {
    if (!this.selectedTrip) return null;
    
    const extraDays = this.requestForm.get('extraDays')?.value || 0;
    if (!extraDays) return this.selectedTrip.endDate;
    
    const newDate = new Date(this.selectedTrip.endDate);
    newDate.setDate(newDate.getDate() + Number(extraDays));
    return newDate;
  }

  // Show help dialog with information about the stay-back policy
  async showHelp() {
    const alert = await this.alertController.create({
      header: 'Stay-back Request Help',
      message: `
        <p>Stay-back requests allow you to extend your business trip for personal travel.</p>
        <ul>
          <li>All stay-back requests must be submitted at least 14 days before your trip starts</li>
          <li>You can request up to 14 extra days</li>
          <li>All expenses during your extended stay are your personal responsibility</li>
          <li>Company insurance only covers you for 2 days beyond your official trip</li>
          <li>Your manager and HR must approve all requests</li>
        </ul>
      `,
      buttons: ['Got it']
    });

    await alert.present();
  }

  // View details of a previous request
  async viewRequestDetails(request: StayBackRequest) {
    const alert = await this.alertController.create({
      header: request.tripDestination,
      subHeader: `Status: ${request.status}`,
      message: `
        <p><strong>Original End Date:</strong> ${request.originalEndDate.toLocaleDateString()}</p>
        <p><strong>Extra Days:</strong> ${request.extraDays}</p>
        <p><strong>New End Date:</strong> ${request.newEndDate.toLocaleDateString()}</p>
        <p><strong>Accommodation:</strong> ${request.accommodationType}</p>
        <p><strong>Reason:</strong> ${request.reason}</p>
        ${request.comments ? `<p><strong>Comments:</strong> ${request.comments}</p>` : ''}
        <p><strong>Submitted:</strong> ${request.submissionDate.toLocaleDateString()}</p>
      `,
      buttons: ['Close']
    });

    await alert.present();
  }

  // Get status color for badges
  getStatusColor(status: string): string {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'warning';
    }
  }

  // Submit the stay-back request
  async submitRequest() {
    this.submitted = true;

    // Stop if form is invalid
    if (this.requestForm.invalid) {
      const toast = await this.toastController.create({
        message: 'Please fill all required fields correctly',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      toast.present();
      return;
    }

    this.isSubmitting = true;

    try {
      // Show loading
      const loading = await this.loadingController.create({
        message: 'Submitting your request...',
        duration: 2000
      });
      await loading.present();

      // Get form values
      const formValues = this.requestForm.value;
      const trip = this.upcomingTrips.find(t => t.id === formValues.tripId);

      if (!trip) {
        throw new Error('Trip not found');
      }

      // Create request object
      const newRequest: StayBackRequest = {
        id: 'r' + Date.now(),
        tripId: formValues.tripId,
        tripDestination: trip.destination,
        originalEndDate: new Date(trip.endDate),
        extraDays: formValues.extraDays,
        newEndDate: this.calculateNewReturnDate() as Date,
        accommodationType: formValues.accommodationType,
        accommodationAddress: formValues.accommodationAddress,
        reason: formValues.reason,
        emergencyContact: formValues.emergencyContact,
        submissionDate: new Date(),
        status: 'Pending'
      };

      // Add to previous requests
      this.previousRequests.unshift(newRequest);

      // Save to storage
      await this.storageService.set('stay-back-requests', JSON.stringify(this.previousRequests));

      // Dismiss loading
      await loading.dismiss();

      // Show success message
      const toast = await this.toastController.create({
        message: 'Your stay-back request has been submitted successfully',
        duration: 3000,
        color: 'success',
        position: 'bottom'
      });
      toast.present();

      // Reset form
      this.requestForm.reset();
      this.submitted = false;
      this.selectedTrip = null;

    } catch (error) {
      console.error('Error submitting request:', error);
      const toast = await this.toastController.create({
        message: 'There was an error submitting your request. Please try again.',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      toast.present();
    } finally {
      this.isSubmitting = false;
    }
  }
}
