import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { MoodBoardAdminPage } from './mood-board-admin.page';

const routes: Routes = [
  {
    path: '',
    component: MoodBoardAdminPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MoodBoardAdminPage]
})
export class MoodBoardAdminPageModule {} 