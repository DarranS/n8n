import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'public',
    loadComponent: () => import('./pages/public-home/public-home.component').then(m => m.PublicHomeComponent)
  },
  {
    path: '',
    redirectTo: 'public',
    pathMatch: 'full'
  },
  {
    path: 'research',
    loadComponent: () => import('./pages/research-home/research-home.component').then(m => m.ResearchHomeComponent),
    canActivate: [AuthGuard]
  },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'chat', loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatPageComponent) },
  { path: 'links', loadComponent: () => import('./pages/links/links.component').then(m => m.LinksComponent) },
  { path: 'import', loadComponent: () => import('./components/tabs/import-tab/import-tab.component').then(m => m.ImportTabComponent) }
];
