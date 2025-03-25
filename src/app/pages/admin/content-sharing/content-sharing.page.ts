import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-content-sharing',
  templateUrl: './content-sharing.page.html',
  styleUrls: ['./content-sharing.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ContentSharingPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
