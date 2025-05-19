import { Injectable } from '@angular/core';
import { PublicClientApplication, Configuration, AuthenticationResult, InteractionRequiredAuthError, AccountInfo, LogLevel } from '@azure/msal-browser';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private msalInstance: PublicClientApplication;
  private initialized = false;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userInfo = new BehaviorSubject<AccountInfo | null>(null);

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    const config: Configuration = {
      auth: {
        clientId: environment.auth.clientId,
        authority: environment.auth.authority,
        redirectUri: environment.auth.redirectUri,
        postLogoutRedirectUri: environment.auth.postLogoutRedirectUri,
        navigateToLoginRequestUrl: environment.auth.navigateToLoginRequestUrl,
        knownAuthorities: ['login.microsoftonline.com'],
      },
      cache: {
        cacheLocation: 'localStorage',
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
    };
    this.msalInstance = new PublicClientApplication(config);
    this.initializeMsal().catch(error => console.error('Failed to initialize MSAL:', error));
  }

  async initializeMsal(): Promise<void> {
    if (!this.initialized) {
      await this.msalInstance.initialize();
      this.initialized = true;
      const accounts = this.msalInstance.getAllAccounts();
      console.log('[MSAL] Initialized. Accounts:', accounts);
      if (accounts.length > 0) {
        this.msalInstance.setActiveAccount(accounts[0]);
        this.loggedIn.next(true);
        this.userInfo.next(accounts[0]);
        console.log('[MSAL] Active account set after init:', accounts[0]);
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
    try {
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: environment.auth.scopes,
        prompt: 'select_account',
      });
      console.log('[MSAL] Login response:', loginResponse);
      this.msalInstance.setActiveAccount(loginResponse.account);
      this.loggedIn.next(true);
      this.userInfo.next(loginResponse.account);
      console.log('[MSAL] Active account after login:', loginResponse.account);
      // Navigate to research page after successful login
      this.router.navigate(['/research']);
    } catch (error) {
      console.error('[MSAL] Login error:', error);
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
    console.log('[MSAL] Logged out');
    // Navigate to home page after logout
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getLoggedInStatus() {
    const obs = this.loggedIn.asObservable();
    obs.subscribe(val => console.log('[MSAL] loggedIn status changed:', val));
    return obs;
  }

  getUserInfo() {
    const obs = this.userInfo.asObservable();
    obs.subscribe(val => console.log('[MSAL] userInfo changed:', val));
    return obs;
  }

  getActiveAccount() {
    return this.msalInstance.getActiveAccount();
  }

  async getToken(): Promise<string | null> {
    await this.initializeMsal();
    const account = this.msalInstance.getActiveAccount() || this.msalInstance.getAllAccounts()[0];
    console.log('[MSAL] getToken - active account:', account);
    if (!account) {
      await this.login();
      return this.getToken();
    }
    try {
      const tokenResponse = await this.msalInstance.acquireTokenSilent({
        account,
        scopes: environment.auth.scopes,
      });
      console.log('[MSAL] Token acquired:', tokenResponse);
      return tokenResponse.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        console.warn('[MSAL] Interaction required for token, logging in again.');
        await this.login();
        return this.getToken();
      }
      console.error('[MSAL] Token acquisition error:', error);
      return null;
    }
  }
} 