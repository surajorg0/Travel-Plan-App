import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonBadge,
  IonIcon,
  IonText,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  helpBuoyOutline,
  timeOutline,
  paperPlaneOutline,
  attachOutline,
  documentOutline,
  closeCircle,
  eyeOutline,
  homeOutline,
  documentTextOutline,
  imagesOutline,
  trophyOutline,
  personOutline
} from 'ionicons/icons';
import { AuthService, User } from 'src/app/services/auth.service';

interface Attachment {
  id: number;
  name: string;
  size: string;
  url: string;
}

interface SupportTicket {
  id?: number;
  subject: string;
  category: string;
  priority: string;
  description: string;
  status?: string;
  createdAt?: Date;
  attachments: Attachment[];
}

@Component({
  selector: 'app-support-ticket',
  templateUrl: './support-ticket.page.html',
  styleUrls: ['./support-ticket.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonButtons,
    IonBackButton,
    IonBadge,
    IonIcon,
    IonText
  ]
})
export class SupportTicketPage implements OnInit {
  user: User | null = null;
  isSubmitting = false;
  
  ticket: SupportTicket = {
    subject: '',
    category: 'travel-booking',
    priority: 'medium',
    description: '',
    attachments: []
  };
  
  pastTickets: SupportTicket[] = [];
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      helpBuoyOutline,
      timeOutline,
      paperPlaneOutline,
      attachOutline,
      documentOutline,
      closeCircle,
      eyeOutline,
      homeOutline,
      documentTextOutline,
      imagesOutline,
      trophyOutline,
      personOutline
    });
  }

  async ngOnInit() {
    this.user = this.authService.currentUserValue;
    
    if (!this.user) {
      // If not authenticated, get user from storage
      await this.authService.initAuth();
      this.user = this.authService.currentUserValue;
      
      if (!this.user) {
        this.router.navigate(['/auth/login']);
        return;
      }
    }
    
    // Load mock past tickets
    this.loadMockTickets();
  }
  
  loadMockTickets() {
    this.pastTickets = [
      {
        id: 1,
        subject: 'Flight Rescheduling Request',
        category: 'travel-booking',
        priority: 'high',
        description: 'I need to reschedule my flight to Dubai due to a scheduling conflict. The current flight is on March 25th, and I would like to move it to March 28th if possible.',
        status: 'open',
        createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        attachments: []
      },
      {
        id: 2,
        subject: 'Visa Documentation Question',
        category: 'visa',
        priority: 'medium',
        description: 'I have questions about the required documentation for my Dubai visa application. Can you provide a detailed checklist of all required documents?',
        status: 'in progress',
        createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        attachments: [
          {
            id: 1,
            name: 'passport_scan.pdf',
            size: '2.4 MB',
            url: '#'
          }
        ]
      },
      {
        id: 3,
        subject: 'Hotel Booking Confirmation',
        category: 'accommodation',
        priority: 'low',
        description: 'I have not received my hotel booking confirmation email yet. The reservation was made last week for the Burj Al Arab from April 10-15.',
        status: 'resolved',
        createdAt: new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        attachments: []
      }
    ];
  }
  
  async submitTicket() {
    // Validate form
    if (!this.ticket.subject.trim() || !this.ticket.description.trim()) {
      const toast = await this.toastController.create({
        message: 'Please fill in all required fields',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      return;
    }
    
    this.isSubmitting = true;
    
    // Simulate API call
    setTimeout(async () => {
      // Add to past tickets
      this.pastTickets.unshift({
        id: this.pastTickets.length + 1,
        ...this.ticket,
        status: 'open',
        createdAt: new Date()
      });
      
      // Reset form
      this.ticket = {
        subject: '',
        category: 'travel-booking',
        priority: 'medium',
        description: '',
        attachments: []
      };
      
      // Show success message
      const toast = await this.toastController.create({
        message: 'Support ticket submitted successfully',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
      
      this.isSubmitting = false;
    }, 1500);
  }
  
  attachFile() {
    // Simulate file attachment
    const fileNames = [
      'travel_itinerary.pdf',
      'booking_receipt.pdf',
      'passport_copy.jpg',
      'flight_details.docx',
      'hotel_reservation.pdf'
    ];
    
    const randomFile = fileNames[Math.floor(Math.random() * fileNames.length)];
    const fileSize = (Math.random() * 5 + 0.5).toFixed(1) + ' MB';
    
    this.ticket.attachments.push({
      id: this.ticket.attachments.length + 1,
      name: randomFile,
      size: fileSize,
      url: '#'
    });
  }
  
  removeAttachment(index: number) {
    this.ticket.attachments.splice(index, 1);
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'open': return 'primary';
      case 'in progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'medium';
      default: return 'medium';
    }
  }
  
  async viewTicket(ticket: SupportTicket) {
    const alert = await this.alertController.create({
      header: ticket.subject,
      subHeader: `Status: ${ticket.status} | Created: ${new Date(ticket.createdAt!).toLocaleDateString()}`,
      message: `
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>Description:</strong><br>${ticket.description}</p>
        ${ticket.attachments.length > 0 ? 
          `<p><strong>Attachments:</strong><br>${ticket.attachments.map(a => a.name).join('<br>')}</p>` : 
          ''}
      `,
      buttons: ['Close']
    });
    
    await alert.present();
  }
}
