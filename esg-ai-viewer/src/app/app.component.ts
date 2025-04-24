import { Component, OnInit, OnDestroy } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { filter, takeUntil, catchError } from 'rxjs/operators';
import { EventMessage, EventType, AuthenticationResult, BrowserAuthError } from '@azure/msal-browser';
import { AuthService } from './auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="app-container" *ngIf="initialized">
      <app-header></app-header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
    <div *ngIf="!initialized" class="loading-container">
      <p>Initializing application...</p>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
      padding: 1rem;
      margin-top: 64px; /* Add margin to account for fixed header */
    }
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 1.2rem;
      color: #666;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly destroying$ = new Subject<void>();
  initialized = false;

  constructor(
    private msalService: MsalService,
    private authService: AuthService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  async ngOnInit() {
    try {
      // Wait for MSAL to initialize
      await firstValueFrom(
        this.msalService.initialize().pipe(
          catchError((error: Error) => {
            console.error('MSAL initialization error:', error);
            throw error;
          })
        )
      );

      // Enable account storage events
      this.msalService.instance.enableAccountStorageEvents();

      // Set up event handling
      this.msalBroadcastService.msalSubject$
        .pipe(
          filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
          takeUntil(this.destroying$)
        )
        .subscribe((result: EventMessage) => {
          if (result.payload) {
            const payload = result.payload as AuthenticationResult;
            this.msalService.instance.setActiveAccount(payload.account);
          }
        });

      // Now handle any redirect
      const redirectResponse = await this.msalService.instance.handleRedirectPromise()
        .catch((error: Error) => {
          console.error('Redirect handling error:', error);
          return null;
        });

      if (redirectResponse) {
        console.log('Redirect response received:', redirectResponse);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error during app initialization:', error);
      // Still show the app even if initialization fails
      this.initialized = true;
    }
  }

  ngOnDestroy() {
    this.destroying$.next(undefined);
    this.destroying$.complete();
  }
}
