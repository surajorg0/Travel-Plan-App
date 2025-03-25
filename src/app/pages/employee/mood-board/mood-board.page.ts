import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, ToastController, IonicModule } from '@ionic/angular';
import { heartOutline, heart, imageOutline, shareOutline, trashOutline, addOutline, optionsOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MoodBoardImage {
  id: number;
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  dateAdded: Date;
}

@Component({
  selector: 'app-mood-board',
  templateUrl: './mood-board.page.html',
  styleUrls: ['./mood-board.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MoodBoardPage implements OnInit {
  // Properties
  selectedCategory: string = 'all';
  searchTerm: string = '';
  allImages: MoodBoardImage[] = [];
  filteredImages: MoodBoardImage[] = [];

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadMockData();
    this.filteredImages = [...this.allImages];
  }

  // Load mock data for demonstration
  loadMockData() {
    this.allImages = [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
        title: 'Burj Khalifa',
        description: 'The tallest building in the world, a must-visit Dubai attraction.',
        category: 'attractions',
        tags: ['architecture', 'skyline', 'landmark'],
        isFavorite: true,
        dateAdded: new Date('2023-05-15')
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1533395427226-a0c0c81f3693',
        title: 'Palm Jumeirah',
        description: 'An artificial archipelago in the shape of a palm tree.',
        category: 'attractions',
        tags: ['beach', 'luxury', 'island'],
        isFavorite: false,
        dateAdded: new Date('2023-06-22')
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1578681041175-9717c638d482',
        title: 'Dubai Marina',
        description: 'An artificial canal city with a two-mile stretch along the Persian Gulf shoreline.',
        category: 'attractions',
        tags: ['waterfront', 'skyline', 'yacht'],
        isFavorite: true,
        dateAdded: new Date('2023-07-05')
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1589262804704-c5aa9e6def89',
        title: 'Burj Al Arab',
        description: 'Luxury hotel located on its own island, famous for its sail-shaped structure.',
        category: 'hotels',
        tags: ['luxury', 'hotel', 'architecture'],
        isFavorite: false,
        dateAdded: new Date('2023-05-18')
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
        title: 'Atlantis, The Palm',
        description: 'A luxury hotel resort located at the apex of the Palm Jumeirah.',
        category: 'hotels',
        tags: ['resort', 'waterpark', 'luxury'],
        isFavorite: true,
        dateAdded: new Date('2023-06-10')
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1626015449968-da241c406f47',
        title: 'Dubai Desert Safari',
        description: 'Experience dune bashing, camel riding, and traditional entertainment.',
        category: 'attractions',
        tags: ['adventure', 'desert', 'safari'],
        isFavorite: false,
        dateAdded: new Date('2023-07-12')
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1603033156166-2ae22eb2b7e2',
        title: 'Dubai Mall Food Court',
        description: 'One of the largest mall food courts with international cuisine options.',
        category: 'food',
        tags: ['dining', 'shopping', 'international'],
        isFavorite: true,
        dateAdded: new Date('2023-05-25')
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        title: 'Traditional Arabic Restaurant',
        description: 'Authentic Emirati cuisine with traditional ambiance.',
        category: 'food',
        tags: ['traditional', 'arabic', 'authentic'],
        isFavorite: false,
        dateAdded: new Date('2023-06-30')
      }
    ];
  }

  // Filter images based on selected category and search term
  filterImages() {
    this.filteredImages = this.allImages.filter(image => {
      // Filter by category
      const categoryMatch = this.selectedCategory === 'all' || image.category === this.selectedCategory;
      
      // Filter by search term
      const searchTermLower = this.searchTerm.toLowerCase();
      const searchMatch = !this.searchTerm || 
                          image.title.toLowerCase().includes(searchTermLower) || 
                          image.description.toLowerCase().includes(searchTermLower) ||
                          image.tags.some(tag => tag.toLowerCase().includes(searchTermLower));
      
      return categoryMatch && searchMatch;
    });
  }

  // Toggle favorite status
  toggleFavorite(event: Event, image: MoodBoardImage) {
    event.stopPropagation(); // Prevent opening the image detail
    image.isFavorite = !image.isFavorite;
    
    this.showToast(image.isFavorite ? 
      `Added ${image.title} to favorites` : 
      `Removed ${image.title} from favorites`);
  }

  // View image details
  async viewImage(image: MoodBoardImage) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: image.title,
      buttons: [
        {
          text: 'View Details',
          icon: imageOutline,
          handler: () => {
            this.showImageDetails(image);
          }
        },
        {
          text: 'Share',
          icon: shareOutline,
          handler: () => {
            this.shareImage(image);
          }
        },
        {
          text: image.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
          icon: image.isFavorite ? heart : heartOutline,
          handler: () => {
            this.toggleFavorite(new Event('actionsheet'), image);
          }
        },
        {
          text: 'Delete',
          icon: trashOutline,
          role: 'destructive',
          handler: () => {
            this.deleteImage(image);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }

  // Show image details in an alert
  async showImageDetails(image: MoodBoardImage) {
    const alert = await this.alertCtrl.create({
      header: image.title,
      message: `
        <div class="image-detail">
          <img src="${image.url}" alt="${image.title}">
          <p>${image.description}</p>
          <p><strong>Category:</strong> ${image.category}</p>
          <p><strong>Tags:</strong> ${image.tags.join(', ')}</p>
          <p><strong>Added:</strong> ${image.dateAdded.toLocaleDateString()}</p>
        </div>
      `,
      buttons: ['Close']
    });

    await alert.present();
  }

  // Share image functionality
  shareImage(image: MoodBoardImage) {
    // In a real app, this would use the Share API
    this.showToast(`Sharing ${image.title}...`);
  }

  // Delete image
  async deleteImage(image: MoodBoardImage) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${image.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.allImages = this.allImages.filter(img => img.id !== image.id);
            this.filterImages();
            this.showToast(`Deleted ${image.title}`);
          }
        }
      ]
    });

    await alert.present();
  }

  // Open filter options
  async openFilterOptions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Filter Options',
      buttons: [
        {
          text: 'Sort by Newest',
          handler: () => {
            this.sortImages('newest');
          }
        },
        {
          text: 'Sort by Oldest',
          handler: () => {
            this.sortImages('oldest');
          }
        },
        {
          text: 'Show Favorites Only',
          handler: () => {
            this.showFavoritesOnly();
          }
        },
        {
          text: 'Reset Filters',
          handler: () => {
            this.resetFilters();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }

  // Sort images by date
  sortImages(order: 'newest' | 'oldest') {
    this.filteredImages.sort((a, b) => {
      if (order === 'newest') {
        return b.dateAdded.getTime() - a.dateAdded.getTime();
      } else {
        return a.dateAdded.getTime() - b.dateAdded.getTime();
      }
    });
    
    this.showToast(`Sorted by ${order}`);
  }

  // Show only favorite images
  showFavoritesOnly() {
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.filteredImages = this.allImages.filter(image => image.isFavorite);
    this.showToast('Showing favorites only');
  }

  // Reset all filters
  resetFilters() {
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.filteredImages = [...this.allImages];
    this.showToast('Filters reset');
  }

  // Add new image to mood board
  async addNewImage() {
    const alert = await this.alertCtrl.create({
      header: 'Add New Image',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Title'
        },
        {
          name: 'url',
          type: 'text',
          placeholder: 'Image URL'
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Description'
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Category (attractions, hotels, food)'
        },
        {
          name: 'tags',
          type: 'text',
          placeholder: 'Tags (comma separated)'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            if (!data.title || !data.url) {
              this.showToast('Title and URL are required');
              return false;
            }
            
            const newImage: MoodBoardImage = {
              id: this.allImages.length + 1,
              url: data.url,
              title: data.title,
              description: data.description || '',
              category: data.category || 'others',
              tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
              isFavorite: false,
              dateAdded: new Date()
            };
            
            this.allImages.unshift(newImage);
            this.filterImages();
            return true;
          }
        }
      ]
    });
    
    await alert.present();
  }

  // Show toast message
  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    
    await toast.present();
  }
}
