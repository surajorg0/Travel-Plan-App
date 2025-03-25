import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-mood-board',
  templateUrl: './mood-board.page.html',
  styleUrls: ['./mood-board.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MoodBoardPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('Admin mood board initialized');
  }
} 