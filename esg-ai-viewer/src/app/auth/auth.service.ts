import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { protectedResources, loginRequest } from './auth-config';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BrowserAuthError, PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationResult } from '@azure/msal-browser';

const TENANT_ID = 'fcc16827-3d82-4edf-9dc2-5d034f97127e';
const TENANT_AUTHORITY = `https://login.microsoftonline.com/${TENANT_ID}`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticating = false;

  constructor(
    private msalService: MsalService,
    private snackBar: MatSnackBar
  ) {}

  async clearLoginState() {
    try {
      // Clear browser storage
      window.sessionStorage.clear();
      window.localStorage.clear();
      
      // Clear all cookies that might be related to MSAL
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      
      // Force reload the page to clear any in-memory state
      window.location.reload();
      
      this.snackBar.open('Login state cleared successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } catch (error) {
      console.error('Error clearing login state:', error);
      this.snackBar.open('Error clearing login state', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  async login() {
    try {
      const result = await this.msalService.loginPopup().toPromise();
      if (result) {
        this.msalService.instance.setActiveAccount(result.account);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async logout() {
    try {
      await this.msalService.logout().toPromise();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0;
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