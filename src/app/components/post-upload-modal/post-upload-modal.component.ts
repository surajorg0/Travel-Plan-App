import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonButtons,
  IonIcon,
  IonFab,
  IonFabButton,
  ModalController,
  ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  imageOutline,
  cameraOutline,
  imagesOutline,
  addOutline,
  locationOutline,
  personOutline
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-post-upload-modal',
  templateUrl: './post-upload-modal.component.html',
  styleUrls: ['./post-upload-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonButtons,
    IonIcon,
    IonFab,
    IonFabButton
  ]
})
export class PostUploadModalComponent implements OnInit {
  postForm: FormGroup;
  photoUrl: string | null = null;
  isSubmitted = false;

  constructor(
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private formBuilder: FormBuilder
  ) {
    addIcons({
      closeOutline,
      imageOutline,
      cameraOutline,
      imagesOutline,
      addOutline,
      locationOutline,
      personOutline
    });

    this.postForm = this.formBuilder.group({
      caption: ['', [Validators.required, Validators.maxLength(500)]],
      location: [''],
      tags: ['']
    });
  }

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss();
  }

  async selectPhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          icon: 'image-outline',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Use Camera',
          icon: 'camera-outline',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 1200,
        height: 1200
      });
      
      this.photoUrl = image.dataUrl || null;
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }

  submitPost() {
    this.isSubmitted = true;
    
    if (this.postForm.valid && this.photoUrl) {
      // Process tags if provided
      let tagsArray: string[] = [];
      if (this.postForm.value.tags) {
        tagsArray = this.postForm.value.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);
      }
      
      const postData = {
        photoUrl: this.photoUrl,
        caption: this.postForm.value.caption,
        location: this.postForm.value.location || '',
        tags: tagsArray
      };
      
      this.modalController.dismiss(postData);
    }
  }
} 