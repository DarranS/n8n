import { Injectable } from '@angular/core';
import { PublicClientApplication, Configuration, AuthenticationResult, InteractionRequiredAuthError, AccountInfo, LogLevel } from '@azure/msal-browser';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfigService } from '../services/config.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private msalInstance: PublicClientApplication;
  private initialized = false;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userInfo = new BehaviorSubject<AccountInfo | null>(null);

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private configService: ConfigService
  ) {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Config not loaded!');
    }
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: config.auth.clientId,
        authority: config.auth.authority,
        redirectUri: config.auth.redirectUri,
        postLogoutRedirectUri: config.auth.postLogoutRedirectUri,
        navigateToLoginRequestUrl: config.auth.navigateToLoginRequestUrl,
        knownAuthorities: ['login.microsoftonline.com'],
      },
      cache: {
        cacheLocation: config.auth.cacheLocation || 'localStorage',
        storeAuthStateInCookie: false,
      },
      system: {
        loggerOptions: {
          loggerCallback: (level: LogLevel, message: string) => {
            if (level <= LogLevel.Warning) {
              console.warn(message);
            }
          },
          logLevel: LogLevel.Warning,
          piiLoggingEnabled: false,
        },
      },
    });
    this.initializeMsal().catch(error => console.error('Failed to initialize MSAL:', error));
  }

  async initializeMsal(): Promise<void> {
    if (!this.initialized) {
      await this.msalInstance.initialize();
      this.initialized = true;
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        this.msalInstance.setActiveAccount(accounts[0]);
        this.loggedIn.next(true);
        this.userInfo.next(accounts[0]);
        // Navigate to research page if on home page
        if (window.location.pathname === '/') {
          this.router.navigate(['/research']);
        }
      } else {
        this.loggedIn.next(false);
        this.userInfo.next(null);
      }
    }
  }

  async login(): Promise<void> {
    await this.initializeMsal();
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Config not loaded!');
    }
    try {
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: config.auth.scopes,
        prompt: 'select_account',
      });
      this.msalInstance.setActiveAccount(loginResponse.account);
      this.loggedIn.next(true);
      this.userInfo.next(loginResponse.account);
      // Navigate to research page after successful login
      this.router.navigate(['/research']);
    } catch (error) {
      this.loggedIn.next(false);
      this.userInfo.next(null);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.initializeMsal();
    await this.msalInstance.logoutPopup();
    this.loggedIn.next(false);
    this.userInfo.next(null);
    // Navigate to home page after logout
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getLoggedInStatus() {
    const obs = this.loggedIn.asObservable();
    return obs;
  }

  getUserInfo() {
    const obs = this.userInfo.asObservable();
    return obs;
  }

  getActiveAccount() {
    return this.msalInstance.getActiveAccount();
  }

  async getToken(): Promise<string | null> {
    await this.initializeMsal();
    const account = this.msalInstance.getActiveAccount() || this.msalInstance.getAllAccounts()[0];
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Config not loaded!');
    }
    if (!account) {
      await this.login();
      return this.getToken();
    }
    try {
      const tokenResponse = await this.msalInstance.acquireTokenSilent({
        account,
        scopes: config.auth.scopes,
      });
      return tokenResponse.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await this.login();
        return this.getToken();
      }
      return null;
    }
  }
} 