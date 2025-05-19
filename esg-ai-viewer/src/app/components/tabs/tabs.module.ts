import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RawTabComponent } from './raw-tab/raw-tab.component';
import { QuestionTabComponent } from './question-tab/question-tab.component';

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
    RouterModule.forChild(routes)
  ],
  exports: [RawTabComponent, QuestionTabComponent]
})
export class TabsModule { } 