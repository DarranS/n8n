import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { protectedResources, loginRequest } from './auth-config';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BrowserAuthError, PublicClientApplication, InteractionStatus, AuthenticationResult } from '@azure/msal-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

const TENANT_ID = 'fcc16827-3d82-4edf-9dc2-5d034f97127e';
const TENANT_AUTHORITY = `https://login.microsoftonline.com/${TENANT_ID}`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggingIn = false;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userInfo = new BehaviorSubject<any>(null);

  constructor(
    private msalService: MsalService,
    private snackBar: MatSnackBar
  ) {
    this.initializeAuth();
  }

  private initializeAuth() {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.loggedIn.next(true);
      this.userInfo.next(accounts[0]);
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
  }

  private async cleanupInteractions(): Promise<void> {
    try {
      await this.msalService.instance.handleRedirectPromise();
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length === 0) {
        this.msalService.instance.setActiveAccount(null);
      }
    } catch (error) {
      console.log('Cleanup completed with:', error);
    }
  }

  async login(): Promise<void> {
    if (this.isLoggingIn) {
      this.snackBar.open('Login already in progress, please wait...', 'Close', { duration: 3000 });
      return;
    }

    try {
      this.isLoggingIn = true;
      await this.cleanupInteractions();

      const result = await this.msalService.loginPopup({
        ...loginRequest,
        authority: TENANT_AUTHORITY,
        prompt: 'select_account'
      }).toPromise();

      if (result) {
        this.msalService.instance.setActiveAccount(result.account);
        this.loggedIn.next(true);
        this.userInfo.next(result.account);
      }
    } catch (error: unknown) {
      if (error instanceof BrowserAuthError && error.errorCode === 'interaction_in_progress') {
        await this.clearLoginState();
      }
      console.error('Login error:', error);
      this.snackBar.open('Login failed. Please try again.', 'Close', { duration: 5000 });
      throw error;
    } finally {
      this.isLoggingIn = false;
    }
  }

  async clearLoginState() {
    try {
      await this.msalService.instance.handleRedirectPromise();
      this.msalService.instance.setActiveAccount(null);
      this.loggedIn.next(false);
      this.userInfo.next(null);
    } catch (error) {
      console.error('Error clearing login state:', error);
    }
  }

  logout(): void {
    this.msalService.logout().subscribe(() => {
      this.loggedIn.next(false);
      this.userInfo.next(null);
    });
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getLoggedInStatus(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getUserInfo(): Observable<any> {
    return this.userInfo.asObservable();
  }

  getActiveAccount() {
    return this.msalService.instance.getActiveAccount();
  }

  getAccessToken(): Observable<string | null> {
    const request = {
      ...protectedResources.graphMe,
      authority: TENANT_AUTHORITY
    };

    return this.msalService.acquireTokenSilent(request).pipe(
      map(response => response.accessToken),
      catchError(error => {
        console.error('Error acquiring token:', error);
        return from([null]);
      })
    );
  }
} 