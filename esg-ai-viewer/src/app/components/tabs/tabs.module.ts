import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RawTabComponent } from './raw-tab/raw-tab.component';

const routes: Routes = [
  {
    path: '',
    component: RawTabComponent
  }
];

@NgModule({
  declarations: [RawTabComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class TabsModule { } 