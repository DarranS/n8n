import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ThemeService } from './services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkTheme$ | async" [class.light-theme]="!(isDarkTheme$ | async)">
      <app-header></app-header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .app-container {
      min-height: 100vh;
      background-color: var(--background-color);
      color: var(--text-color);
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    main {
      padding: 20px;
      margin-top: 80px;
    }
  `]
})
export class AppComponent implements OnInit {
  isDarkTheme$: Observable<boolean>;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  ngOnInit() {
    // Theme service will automatically initialize based on user preferences
  }
}
