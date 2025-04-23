import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent) },
  { path: 'chat', loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatPageComponent) },
  { path: 'links', loadComponent: () => import('./pages/links/links.component').then(m => m.LinksComponent) },
  { path: '**', redirectTo: '' }
];
