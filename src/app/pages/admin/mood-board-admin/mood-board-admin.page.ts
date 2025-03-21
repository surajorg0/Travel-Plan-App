import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';

interface MoodBoardImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  favoriteCount: number;
  dateAdded: Date;
}

interface Category {
  id: string;
  name: string;
  imageCount: number;
}

@Component({
  selector: 'app-mood-board-admin',
  templateUrl: './mood-board-admin.page.html',
  styleUrls: ['./mood-board-admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MoodBoardAdminPage implements OnInit {
  // Views and filtering
  selectedView: string = 'all';
  searchTerm: string = '';
  
  // Image collections
  allImages: MoodBoardImage[] = [];
  filteredImages: MoodBoardImage[] = [];
  popularImages: MoodBoardImage[] = [];
  
  // Categories
  categories: Category[] = [];
  
  // Stats
  totalImages: number = 0;
  totalFavorites: number = 0;
  newImagesThisWeek: number = 0;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadMockData();
    this.calculateStats();
    this.filterImages();
  }

  loadMockData() {
    // Mock categories
    this.categories = [
      { id: '1', name: 'Attractions', imageCount: 8 },
      { id: '2', name: 'Hotels', imageCount: 5 },
      { id: '3', name: 'Food', imageCount: 4 },
      { id: '4', name: 'Culture', imageCount: 3 }
    ];

    // Mock images
    this.allImages = [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
        title: 'Burj Khalifa',
        description: 'The tallest building in the world, standing at 828 meters.',
        category: 'Attractions',
        tags: ['architecture', 'skyline', 'landmark'],
        favoriteCount: 56,
        dateAdded: new Date('2023-09-15')
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1577447182523-b0bb7de019de',
        title: 'Palm Jumeirah',
        description: 'Artificial archipelago in the shape of a palm tree.',
        category: 'Attractions',
        tags: ['beach', 'island', 'luxury'],
        favoriteCount: 42,
        dateAdded: new Date('2023-10-05')
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1570151158410-6b45978dcba9',
        title: 'Burj Al Arab',
        description: 'Luxury hotel standing on an artificial island.',
        category: 'Hotels',
        tags: ['luxury', 'architecture', 'beach'],
        favoriteCount: 38,
        dateAdded: new Date('2023-08-12')
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8f5',
        title: 'Dubai Mall',
        description: 'One of the largest shopping malls in the world.',
        category: 'Attractions',
        tags: ['shopping', 'entertainment', 'luxury'],
        favoriteCount: 29,
        dateAdded: new Date('2023-09-25')
      },
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1527597295512-42ce22628fc0',
        title: 'Dubai Marina',
        description: 'Artificial canal city with luxury skyscrapers.',
        category: 'Attractions',
        tags: ['waterfront', 'skyscrapers', 'yachts'],
        favoriteCount: 31,
        dateAdded: new Date('2023-11-01')
      },
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1584132967334-7e93a7eb1c3d',
        title: 'Arabic Mezze',
        description: 'Traditional Middle Eastern appetizers and small dishes.',
        category: 'Food',
        tags: ['cuisine', 'traditional', 'appetizers'],
        favoriteCount: 18,
        dateAdded: new Date('2023-10-18')
      },
      {
        id: '7',
        url: 'https://images.unsplash.com/photo-1611892554169-acc2a4659516',
        title: 'Atlantis The Palm',
        description: 'Luxurious 5-star hotel located at the apex of Palm Jumeirah.',
        category: 'Hotels',
        tags: ['luxury', 'resort', 'beach'],
        favoriteCount: 27,
        dateAdded: new Date(new Date().setDate(new Date().getDate() - 5))
      },
      {
        id: '8',
        url: 'https://images.unsplash.com/photo-1634128221889-82ed6efebfc3',
        title: 'Dubai Fountain',
        description: 'Choreographed fountain system set on the Burj Khalifa Lake.',
        category: 'Attractions',
        tags: ['performance', 'water', 'lights'],
        favoriteCount: 23,
        dateAdded: new Date(new Date().setDate(new Date().getDate() - 3))
      },
      {
        id: '9',
        url: 'https://images.unsplash.com/photo-1596627118360-d1f8eda45b76',
        title: 'Al Fahidi Historical District',
        description: 'Traditional wind tower houses and narrow lanes showcase old Dubai.',
        category: 'Culture',
        tags: ['history', 'architecture', 'traditional'],
        favoriteCount: 15,
        dateAdded: new Date(new Date().setDate(new Date().getDate() - 1))
      },
      {
        id: '10',
        url: 'https://images.unsplash.com/photo-1517465219076-d7a5337d9599',
        title: 'Desert Safari',
        description: 'Experience dune bashing, camel riding, and traditional entertainment.',
        category: 'Attractions',
        tags: ['adventure', 'desert', 'culture'],
        favoriteCount: 35,
        dateAdded: new Date(new Date().setDate(new Date().getDate() - 4))
      },
      {
        id: '11',
        url: 'https://images.unsplash.com/photo-1593855682384-d34e30ea4050',
        title: 'Emirati Cuisine',
        description: 'Traditional dishes like Machboos, Al Harees, and Luqaimat.',
        category: 'Food',
        tags: ['traditional', 'local', 'spices'],
        favoriteCount: 20,
        dateAdded: new Date(new Date().setDate(new Date().getDate() - 7))
      },
      {
        id: '12',
        url: 'https://images.unsplash.com/photo-1605055510870-e9946ad20be9',
        title: 'Gold Souk',
        description: 'Traditional market famous for gold jewelry.',
        category: 'Culture',
        tags: ['shopping', 'traditional', 'jewelry'],
        favoriteCount: 19,
        dateAdded: new Date(new Date().setDate(new Date().getDate() - 2))
      },
    ];

    // Sort popular images by favorite count
    this.popularImages = [...this.allImages].sort((a, b) => b.favoriteCount - a.favoriteCount).slice(0, 5);
  }

  calculateStats() {
    this.totalImages = this.allImages.length;
    this.totalFavorites = this.allImages.reduce((sum, image) => sum + image.favoriteCount, 0);
    
    // Count images added in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    this.newImagesThisWeek = this.allImages.filter(image => image.dateAdded > oneWeekAgo).length;
  }

  filterImages() {
    if (this.searchTerm.trim() === '') {
      this.filteredImages = [...this.allImages];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredImages = this.allImages.filter(image => 
        image.title.toLowerCase().includes(searchTermLower) ||
        image.description.toLowerCase().includes(searchTermLower) ||
        image.category.toLowerCase().includes(searchTermLower) ||
        image.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
    }
  }

  refreshImages() {
    // In a real app, this would fetch updated data from a service
    this.loadMockData();
    this.calculateStats();
    this.filterImages();
    
    this.presentToast('Images refreshed successfully');
  }

  switchView() {
    // Any specific logic needed when switching views
    if (this.selectedView === 'all') {
      this.filterImages();
    }
  }

  async showFilterOptions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Filter Images',
      buttons: [
        {
          text: 'All Categories',
          handler: () => {
            this.filterImages();
          }
        },
        ...this.categories.map(category => ({
          text: category.name,
          handler: () => {
            this.filteredImages = this.allImages.filter(image => image.category === category.name);
          }
        })),
        {
          text: 'Most Popular',
          handler: () => {
            this.filteredImages = [...this.allImages].sort((a, b) => b.favoriteCount - a.favoriteCount);
          }
        },
        {
          text: 'Newest First',
          handler: () => {
            this.filteredImages = [...this.allImages].sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
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

  async viewImageDetails(image: MoodBoardImage) {
    const alert = await this.alertCtrl.create({
      header: image.title,
      subHeader: image.category,
      message: `
        <div style="text-align: center; margin-bottom: 15px;">
          <img src="${image.url}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
        </div>
        <p>${image.description}</p>
        <p><strong>Tags:</strong> ${image.tags.join(', ')}</p>
        <p><strong>Favorites:</strong> ${image.favoriteCount}</p>
        <p><strong>Added:</strong> ${image.dateAdded.toLocaleDateString()}</p>
      `,
      buttons: ['Close']
    });

    await alert.present();
  }

  async editImage(image: MoodBoardImage) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Image',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Title',
          value: image.title
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Description',
          value: image.description
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Category',
          value: image.category
        },
        {
          name: 'tags',
          type: 'text',
          placeholder: 'Tags (comma separated)',
          value: image.tags.join(', ')
        },
        {
          name: 'url',
          type: 'url',
          placeholder: 'Image URL',
          value: image.url
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            // Update image data
            const index = this.allImages.findIndex(img => img.id === image.id);
            if (index !== -1) {
              this.allImages[index] = {
                ...this.allImages[index],
                title: data.title,
                description: data.description,
                category: data.category,
                tags: data.tags.split(',').map((tag: string) => tag.trim()),
                url: data.url
              };
              
              // Update filtered images and stats
              this.filterImages();
              this.calculateStats();
              this.presentToast('Image updated successfully');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteImage(image: MoodBoardImage) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete "${image.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            // Remove the image from collections
            this.allImages = this.allImages.filter(img => img.id !== image.id);
            this.filteredImages = this.filteredImages.filter(img => img.id !== image.id);
            this.popularImages = this.popularImages.filter(img => img.id !== image.id);
            
            // Update category counts
            const categoryIndex = this.categories.findIndex(cat => cat.name === image.category);
            if (categoryIndex !== -1) {
              this.categories[categoryIndex].imageCount--;
            }
            
            // Recalculate stats
            this.calculateStats();
            this.presentToast('Image deleted successfully');
          }
        }
      ]
    });

    await alert.present();
  }

  async addNewImage() {
    const alert = await this.alertCtrl.create({
      header: 'Add New Image',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Title*'
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Description*'
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Category*'
        },
        {
          name: 'tags',
          type: 'text',
          placeholder: 'Tags (comma separated)*'
        },
        {
          name: 'url',
          type: 'url',
          placeholder: 'Image URL*'
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
            // Validate required fields
            if (!data.title || !data.description || !data.category || !data.tags || !data.url) {
              this.presentToast('All fields are required', 'warning');
              return false;
            }
            
            // Create new image
            const newImage: MoodBoardImage = {
              id: Date.now().toString(),
              title: data.title,
              description: data.description,
              category: data.category,
              tags: data.tags.split(',').map((tag: string) => tag.trim()),
              url: data.url,
              favoriteCount: 0,
              dateAdded: new Date()
            };
            
            // Add to collections
            this.allImages.unshift(newImage);
            
            // Update category or create new one
            const categoryIndex = this.categories.findIndex(cat => cat.name === data.category);
            if (categoryIndex !== -1) {
              this.categories[categoryIndex].imageCount++;
            } else {
              this.categories.push({
                id: Date.now().toString(),
                name: data.category,
                imageCount: 1
              });
            }
            
            // Refresh data
            this.filterImages();
            this.calculateStats();
            this.presentToast('Image added successfully');
          }
        }
      ]
    });

    await alert.present();
  }

  async addNewCategory() {
    const alert = await this.alertCtrl.create({
      header: 'Add New Category',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Category Name'
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
            if (!data.name) {
              this.presentToast('Category name is required', 'warning');
              return false;
            }
            
            // Check if category already exists
            if (this.categories.some(cat => cat.name.toLowerCase() === data.name.toLowerCase())) {
              this.presentToast('Category already exists', 'warning');
              return false;
            }
            
            // Add new category
            this.categories.push({
              id: Date.now().toString(),
              name: data.name,
              imageCount: 0
            });
            
            this.presentToast('Category added successfully');
          }
        }
      ]
    });

    await alert.present();
  }

  async editCategory(category: Category) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Category',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Category Name',
          value: category.name
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            if (!data.name) {
              this.presentToast('Category name is required', 'warning');
              return false;
            }
            
            // Check if category name already exists (except for the current category)
            if (this.categories.some(cat => cat.id !== category.id && cat.name.toLowerCase() === data.name.toLowerCase())) {
              this.presentToast('Category name already exists', 'warning');
              return false;
            }
            
            const oldName = category.name;
            
            // Update category name
            const index = this.categories.findIndex(cat => cat.id === category.id);
            if (index !== -1) {
              this.categories[index].name = data.name;
            }
            
            // Update image categories
            this.allImages.forEach(image => {
              if (image.category === oldName) {
                image.category = data.name;
              }
            });
            
            this.filterImages();
            this.presentToast('Category updated successfully');
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteCategory(category: Category) {
    // Check if category has images
    if (category.imageCount > 0) {
      const alert = await this.alertCtrl.create({
        header: 'Category Not Empty',
        message: `This category contains ${category.imageCount} images. You must reassign or delete these images before removing the category.`,
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    
    const confirmAlert = await this.alertCtrl.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete the category "${category.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            // Remove category
            this.categories = this.categories.filter(cat => cat.id !== category.id);
            this.presentToast('Category deleted successfully');
          }
        }
      ]
    });

    await confirmAlert.present();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    
    await toast.present();
  }
}
