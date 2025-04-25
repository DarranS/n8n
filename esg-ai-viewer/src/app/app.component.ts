import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    main {
      flex: 1;
      overflow: auto;
      margin-top: 64px; /* Height of the header */
    }
  `],
  standalone: true,
  imports: [RouterOutlet, HeaderComponent]
})
export class AppComponent {
  title = 'ESG AI Viewer';
}
