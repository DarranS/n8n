import { Routes } from '@angular/router';
import { ChatPageComponent } from './pages/chat/chat.component';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'chat', component: ChatPageComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' }
];
