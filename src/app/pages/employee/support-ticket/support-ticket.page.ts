import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-support-ticket',
  templateUrl: './support-ticket.page.html',
  styleUrls: ['./support-ticket.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SupportTicketPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
