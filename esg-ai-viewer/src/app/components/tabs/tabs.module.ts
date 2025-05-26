import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RawTabComponent } from './raw-tab/raw-tab.component';
import { QuestionTabComponent } from './question-tab/question-tab.component';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';

const routes: Routes = [
  {
    path: '',
    component: RawTabComponent
  }
];

@NgModule({
  declarations: [RawTabComponent, QuestionTabComponent],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    RouterModule.forChild(routes)
  ],
  exports: [RawTabComponent, QuestionTabComponent]
})
export class TabsModule { } 