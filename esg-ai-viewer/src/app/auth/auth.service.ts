import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { protectedResources, loginRequest } from './auth-config';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BrowserAuthError, PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

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
      const msalInstance = this.msalService.instance as PublicClientApplication;

      // Try to clear any stuck interactions
      try {
        await msalInstance.handleRedirectPromise().catch(() => {
          // Ignore any errors here as we're just trying to clear previous interactions
        });
      } catch (e) {
        // Ignore any errors from clearing interactions
      }

      // Check if there's an active account
      if (msalInstance.getActiveAccount() === null && 
          msalInstance.getAllAccounts().length > 0) {
        // Set the first account as active if available
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
      }

      // Start new login with a small delay to ensure previous interactions are cleared
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.msalService.loginRedirect(loginRequest).toPromise();
    } catch (error) {
      if (error instanceof BrowserAuthError) {
        if (error.errorCode === 'interaction_in_progress') {
          this.snackBar.open('Login in progress, please wait a moment and try again', 'Clear Login', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          }).onAction().subscribe(() => {
            this.clearLoginState();
          });
        } else {
          this.snackBar.open(`Login error: ${error.errorMessage}`, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          console.error('MSAL error:', error.errorCode, error.errorMessage);
        }
      } else {
        this.snackBar.open('An unexpected error occurred during login', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        console.error('Login error:', error);
      }
    }
  }

  async logout() {
    if (this.isAuthenticating) {
      this.snackBar.open('Logout in progress, please wait...', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }

    try {
      this.isAuthenticating = true;
      await this.msalService.logoutRedirect().toPromise();
    } catch (error) {
      this.snackBar.open('Error during logout', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      console.error('Logout error:', error);
    } finally {
      this.isAuthenticating = false;
    }
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0;
  }

  getCurrentUser() {
    const accounts = this.msalService.instance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  getAccessToken(): Observable<string | null> {
    const request = {
      scopes: protectedResources.graphMe.scopes
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