import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult } from '@azure/msal-browser';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <a routerLink="/" class="logo">
          <h1>{{ title }}</h1>
        </a>
        <nav class="nav">
          <a routerLink="/" [class.active]="isActive('/', true)">Home</a>
          <a routerLink="/chat" [class.active]="isActive('/chat')">Chat</a>
          <a routerLink="/about" [class.active]="isActive('/about')">About</a>
          <a routerLink="/links" [class.active]="isActive('/links')">Links</a>
          <button *ngIf="!isLoggedIn" (click)="login()" class="auth-button">Login</button>
          <button *ngIf="isLoggedIn" (click)="logout()" class="auth-button">Logout</button>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
      display: flex;
      align-items: center;

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .logo {
          text-decoration: none;
          color: inherit;
          flex-shrink: 0;
          
          h1 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
            white-space: nowrap;
          }
        }

        .nav {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-shrink: 0;

          a {
            text-decoration: none;
            color: #666;
            font-weight: 500;
            transition: color 0.2s ease;
            white-space: nowrap;

            &:hover {
              color: #333;
            }

            &.active {
              color: #1976d2;
            }
          }

          .auth-button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            background-color: #1976d2;
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease;

            &:hover {
              background-color: #1565c0;
            }
          }
        }
      }

      @media (max-width: 768px) {
        height: auto;
        padding: 0.5rem;

        .header-content {
          flex-direction: column;
          gap: 1rem;
          padding: 0.5rem;

          .logo h1 {
            font-size: 1.2rem;
          }

          .nav {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }
        }
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  title = 'ESG AI Viewer';
  currentUrl = '';
  isLoggedIn = false;
  private readonly destroying$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  async ngOnInit() {
    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroying$)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
    });

    // Subscribe to auth state changes
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || 
                                    msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
        takeUntil(this.destroying$)
      )
      .subscribe((result: EventMessage) => {
        if (result.payload) {
          const payload = result.payload as AuthenticationResult;
          this.msalService.instance.setActiveAccount(payload.account);
          this.isLoggedIn = true;
        }
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGOUT_SUCCESS),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        this.isLoggedIn = false;
      });

    // Initialize login state
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  ngOnDestroy() {
    this.destroying$.next(undefined);
    this.destroying$.complete();
  }

  isActive(route: string, exact: boolean = false): boolean {
    if (exact) {
      return this.currentUrl === route;
    }
    return this.currentUrl.startsWith(route);
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}