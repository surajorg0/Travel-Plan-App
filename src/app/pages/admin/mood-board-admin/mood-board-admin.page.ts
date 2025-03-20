import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mood-board-admin',
  templateUrl: './mood-board-admin.page.html',
  styleUrls: ['./mood-board-admin.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MoodBoardAdminPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
