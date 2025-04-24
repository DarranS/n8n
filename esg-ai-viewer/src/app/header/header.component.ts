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
      <div class="header-background"></div>
      <div class="header-content">
        <a routerLink="/" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1>{{ title }}</h1>
            <p class="tagline">Sustainable Intelligence Platform</p>
          </div>
        </a>
        <nav class="nav">
          <a routerLink="/" [class.active]="isActive('/', true)" class="nav-link">
            <span class="nav-icon">🔍</span>
            <span class="nav-text">Research</span>
          </a>
          <a routerLink="/chat" [class.active]="isActive('/chat')" class="nav-link">
            <span class="nav-icon">💬</span>
            <span class="nav-text">Chat</span>
          </a>
          <a routerLink="/about" [class.active]="isActive('/about')" class="nav-link">
            <span class="nav-icon">ℹ️</span>
            <span class="nav-text">About</span>
          </a>
          <button *ngIf="!isLoggedIn" (click)="login()" class="auth-button">
            <span class="button-icon">🔑</span>
            <span class="button-text">Login</span>
          </button>
          <button *ngIf="isLoggedIn" (click)="logout()" class="auth-button">
            <span class="button-icon">🚪</span>
            <span class="button-text">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #1a5f7a 0%, #2e7d32 100%);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      padding: 0;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 80px;
      display: flex;
      align-items: center;
      color: white;

      .header-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="rgba(255,255,255,0.05)" d="M0 0h100v100H0z"/><path fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" d="M0 0h100v100H0z"/></svg>');
        opacity: 0.1;
        pointer-events: none;
      }

      .header-content {
        max-width: none;
        margin: 0;
        padding: 0;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        z-index: 1;

        .logo {
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0;
          padding: 0;
          
          .logo-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 8px;
            margin-left: 0;
            
            svg {
              width: 24px;
              height: 24px;
              color: white;
            }
          }

          .logo-text {
            h1 {
              margin: 0;
              font-size: 1.5rem;
              font-weight: 700;
              white-space: nowrap;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              text-align: left;
            }

            .tagline {
              margin: 0;
              font-size: 0.8rem;
              opacity: 0.8;
              font-weight: 500;
              text-align: left;
            }
          }
        }

        .nav {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          margin-left: auto;
          padding-right: 1rem;

          .nav-link {
            text-decoration: none;
            color: rgba(255, 255, 255, 0.8);
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;

            &:hover {
              color: white;
              background: rgba(255, 255, 255, 0.1);
            }

            &.active {
              color: white;
              background: rgba(255, 255, 255, 0.2);
            }

            .nav-icon {
              font-size: 1.2rem;
            }

            .nav-text {
              white-space: nowrap;
            }
          }

          .auth-button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;

            &:hover {
              background: rgba(255, 255, 255, 0.3);
            }

            .button-icon {
              font-size: 1.2rem;
            }

            .button-text {
              white-space: nowrap;
            }
          }
        }
      }

      @media (max-width: 768px) {
        height: auto;
        padding: 0;

        .header-content {
          flex-direction: column;
          gap: 1rem;
          padding: 0.5rem;

          .logo {
            margin-right: 0;
            width: 100%;
            justify-content: center;

            .logo-text {
              h1 {
                font-size: 1.2rem;
                text-align: center;
              }
              .tagline {
                font-size: 0.7rem;
                text-align: center;
              }
            }
          }

          .nav {
            margin-left: 0;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.5rem;

            .nav-link, .auth-button {
              padding: 0.5rem;
              font-size: 0.9rem;
            }
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