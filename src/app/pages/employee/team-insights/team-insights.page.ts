import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonIcon,
  IonLabel,
  IonBadge,
  IonList,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonButton,
  IonThumbnail,
  IonSegment,
  IonSegmentButton,
  AlertController,
  ToastController,
  ModalController
} from '@ionic/angular/standalone';
import { StorageService } from 'src/app/services/storage.service';
import { addIcons } from 'ionicons';
import { 
  peopleCircleOutline, 
  airplaneOutline, 
  flagOutline, 
  gridOutline, 
  listOutline,
  sunnyOutline,
  businessOutline,
  cafeOutline,
  cameraOutline,
  compassOutline,
  boatOutline,
  waterOutline,
  earthOutline,
  wineOutline,
  restaurantOutline,
  mapOutline,
  giftOutline,
  chatbubbleOutline,
  informationCircleOutline,
  leafOutline,
  bicycleOutline,
  cartOutline,
  personOutline
} from 'ionicons/icons';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  interests: string[];
  currentTour?: string;
}

interface InterestStat {
  name: string;
  count: number;
  percentage: number;
}

interface TeamTrip {
  id: number;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  attendees: number;
  description: string;
}

@Component({
  selector: 'app-team-insights',
  templateUrl: './team-insights.page.html',
  styleUrls: ['./team-insights.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonIcon,
    IonLabel,
    IonBadge,
    IonList,
    IonItemSliding,
    IonItemOption,
    IonItemOptions,
    IonAvatar,
    IonGrid,
    IonRow,
    IonCol,
    IonChip,
    IonButton,
    IonThumbnail,
    IonSegment,
    IonSegmentButton,
    CommonModule, 
    FormsModule
  ]
})
export class TeamInsightsPage implements OnInit {
  teamMembers: TeamMember[] = [];
  interestStats: InterestStat[] = [];
  upcomingTrips: TeamTrip[] = [];
  currentView: 'card' | 'list' = 'card';
  teamCount: number = 0;
  upcomingTripsCount: number = 0;
  countriesVisited: number = 0;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private storageService: StorageService
  ) {
    addIcons({
      peopleCircleOutline,
      airplaneOutline,
      flagOutline,
      gridOutline,
      listOutline,
      sunnyOutline,
      businessOutline,
      cafeOutline,
      cameraOutline,
      compassOutline,
      boatOutline,
      waterOutline,
      earthOutline,
      wineOutline,
      restaurantOutline,
      mapOutline,
      giftOutline,
      chatbubbleOutline,
      informationCircleOutline,
      leafOutline,
      bicycleOutline,
      cartOutline,
      personOutline
    });
  }

  async ngOnInit() {
    await this.loadTeamData();
    this.calculateInterestStats();
    
    // Set stats
    this.teamCount = this.teamMembers.length;
    this.upcomingTripsCount = this.upcomingTrips.length;
    this.countriesVisited = 15; // Sample data
  }

  async loadTeamData() {
    // Load from storage or initialize with sample data
    const storedTeamMembers = await this.storageService.get('teamMembers');
    const storedTrips = await this.storageService.get('teamTrips');
    
    if (storedTeamMembers) {
      this.teamMembers = storedTeamMembers;
    } else {
      this.initSampleTeamMembers();
    }
    
    if (storedTrips) {
      this.upcomingTrips = storedTrips;
    } else {
      this.initSampleTrips();
    }
  }

  initSampleTeamMembers() {
    this.teamMembers = [
      {
        id: 1,
        name: 'Admin User',
        role: 'Travel Manager',
        avatar: 'assets/avatars/avatar3.jpg',
        bio: 'Travel enthusiast with over 10 years in corporate travel planning. Loves exploring new cultures and cuisines.',
        interests: ['Cultural Tours', 'Fine Dining', 'Architecture', 'Photography'],
        currentTour: 'Paris, France'
      },
      {
        id: 2,
        name: 'Suraj',
        role: 'Marketing Specialist',
        avatar: 'assets/avatars/avatar1.jpg',
        bio: 'Creative professional with a passion for capturing memorable travel moments. Always ready for an adventure.',
        interests: ['Beach Resorts', 'Casinos', 'Nightlife', 'Water Sports'],
        currentTour: 'Bali, Indonesia'
      },
      {
        id: 3,
        name: 'Jane Smith',
        role: 'Travel Coordinator',
        avatar: 'assets/avatars/avatar2.jpg',
        bio: 'Detailed-oriented travel planner who ensures every trip goes smoothly. Enjoys hiking and nature photography.',
        interests: ['Mountains', 'Hiking', 'Nature', 'Wildlife']
      },
      {
        id: 4,
        name: 'Mike Johnson',
        role: 'Finance Analyst',
        avatar: 'assets/avatars/avatar4.jpg',
        bio: 'Numbers expert by day, travel explorer by weekend. Has visited over 25 countries and counting.',
        interests: ['City Breaks', 'Museums', 'History', 'Local Markets']
      },
      {
        id: 5,
        name: 'Emily Davis',
        role: 'Customer Relations',
        avatar: 'assets/avatars/avatar5.jpg',
        bio: 'People person who loves meeting locals during travels. Fluent in four languages and always learning more.',
        interests: ['Cruise Tours', 'Festivals', 'Local Cuisine', 'Language Learning']
      },
      {
        id: 6,
        name: 'Alex Wilson',
        role: 'IT Specialist',
        avatar: 'assets/avatars/avatar6.jpg',
        bio: 'Tech enthusiast who never travels without gadgets. Enjoys adventure sports and remote destinations.',
        interests: ['Adventure Travel', 'Extreme Sports', 'Photography', 'Remote Destinations']
      }
    ];
    
    // Save to storage
    this.storageService.set('teamMembers', this.teamMembers);
  }

  initSampleTrips() {
    this.upcomingTrips = [
      {
        id: 1,
        destination: 'Tokyo, Japan',
        image: 'assets/destinations/tokyo.jpg',
        startDate: new Date(2023, 8, 15).toISOString(),
        endDate: new Date(2023, 8, 25).toISOString(),
        attendees: 8,
        description: 'Team building trip to explore Japanese culture, visit technology hubs, and experience local cuisine.'
      },
      {
        id: 2,
        destination: 'Barcelona, Spain',
        image: 'assets/destinations/barcelona.jpg',
        startDate: new Date(2023, 9, 10).toISOString(),
        endDate: new Date(2023, 9, 18).toISOString(),
        attendees: 12,
        description: 'Annual company retreat featuring architectural tours, team workshops, and Mediterranean cuisine experiences.'
      },
      {
        id: 3,
        destination: 'New York, USA',
        image: 'assets/destinations/newyork.jpg',
        startDate: new Date(2023, 10, 5).toISOString(),
        endDate: new Date(2023, 10, 12).toISOString(),
        attendees: 6,
        description: 'Business conference trip with additional time for Broadway shows and city exploration.'
      }
    ];
    
    // Save to storage
    this.storageService.set('teamTrips', this.upcomingTrips);
  }

  calculateInterestStats() {
    // Count occurrences of each interest
    const interestCounts = new Map<string, number>();
    let totalInterests = 0;
    
    this.teamMembers.forEach(member => {
      member.interests.forEach(interest => {
        interestCounts.set(interest, (interestCounts.get(interest) || 0) + 1);
        totalInterests++;
      });
    });
    
    // Convert to array and sort by count descending
    this.interestStats = Array.from(interestCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalInterests) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  getInterestIcon(interest: string): string {
    const iconMap: {[key: string]: string} = {
      'Beach Resorts': 'sunny-outline',
      'Mountains': 'map-outline',
      'Hiking': 'map-outline',
      'City Breaks': 'business-outline',
      'Cultural Tours': 'compass-outline',
      'Cruise Tours': 'boat-outline',
      'Adventure Travel': 'compass-outline',
      'Local Cuisine': 'restaurant-outline',
      'Fine Dining': 'wine-outline',
      'Photography': 'camera-outline',
      'Casinos': 'business-outline',
      'Nightlife': 'business-outline',
      'Museums': 'business-outline',
      'History': 'business-outline',
      'Wildlife': 'compass-outline',
      'Nature': 'leaf-outline',
      'Architecture': 'business-outline',
      'Local Markets': 'cart-outline',
      'Festivals': 'people-circle-outline',
      'Language Learning': 'chatbubble-outline',
      'Extreme Sports': 'bicycle-outline',
      'Remote Destinations': 'map-outline',
      'Water Sports': 'water-outline'
    };
    
    return iconMap[interest] || 'earth-outline';
  }

  segmentChanged(event: any) {
    this.currentView = event.detail.value;
  }

  async viewTeamMember(member: TeamMember) {
    const alert = await this.alertController.create({
      header: member.name,
      subHeader: member.role,
      message: `<p>${member.bio}</p>
                <p><strong>Interests:</strong> ${member.interests.join(', ')}</p>
                ${member.currentTour ? `<p><strong>Currently in:</strong> ${member.currentTour}</p>` : ''}`,
      buttons: ['Close']
    });
    await alert.present();
  }

  async sendMessage(member: TeamMember) {
    const alert = await this.alertController.create({
      header: `Message to ${member.name}`,
      inputs: [
        {
          name: 'message',
          type: 'textarea',
          placeholder: 'Write your message here...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: (data) => {
            if (data.message) {
              this.showMessageSent(member);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async showMessageSent(member: TeamMember) {
    const toast = await this.toastController.create({
      message: `Message sent to ${member.name}!`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  async viewTripDetails(trip: TeamTrip) {
    const alert = await this.alertController.create({
      header: trip.destination,
      subHeader: `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`,
      message: `<p>${trip.description}</p>
                <p><strong>Team Members Attending:</strong> ${trip.attendees}</p>`,
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        },
        {
          text: 'Express Interest',
          handler: () => {
            this.expressInterestInTrip(trip);
          }
        }
      ]
    });
    await alert.present();
  }

  async expressInterestInTrip(trip: TeamTrip) {
    const toast = await this.toastController.create({
      message: `Your interest in the ${trip.destination} trip has been recorded!`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }
}
