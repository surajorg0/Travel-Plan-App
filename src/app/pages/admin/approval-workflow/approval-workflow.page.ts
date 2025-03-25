import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-approval-workflow',
  templateUrl: './approval-workflow.page.html',
  styleUrls: ['./approval-workflow.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ApprovalWorkflowPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
