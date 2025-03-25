import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-itinerary-management',
  templateUrl: './itinerary-management.page.html',
  styleUrls: ['./itinerary-management.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ItineraryManagementPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
