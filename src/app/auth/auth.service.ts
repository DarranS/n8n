import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, BrowserAuthError } from '@azure/msal-browser';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, filter, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userInfo = new BehaviorSubject<any>(null);
  private isLoggingIn = false;

  constructor(private msalService: MsalService) {
    this.initializeAuth();
  }

  private initializeAuth() {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.loggedIn.next(true);
      this.userInfo.next(accounts[0]);
    }
  }

  private async cleanupInteractions(): Promise<void> {
    try {
      // Force handle any pending redirects
      await this.msalService.instance.handleRedirectPromise();
      // Clear active account to force fresh login
      this.msalService.instance.setActiveAccount(null);
    } catch (error) {
      console.log('Cleanup completed with:', error);
    }
  }

  async login(): Promise<void> {
    if (this.isLoggingIn) {
      console.log('Login already in progress, please wait...');
      return;
    }

    try {
      this.isLoggingIn = true;
      
      // Clean up any existing interactions
      await this.cleanupInteractions();

      // Use popup login with minimal configuration
      const result = await this.msalService.loginPopup({
        scopes: ['User.Read'],
        prompt: 'select_account'
      }).toPromise();

      if (result) {
        this.loggedIn.next(true);
        this.userInfo.next(result.account);
        console.log('Login successful');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error;
    } finally {
      this.isLoggingIn = false;
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

  getAccessToken(): Observable<string> {
    return from(this.msalService.instance.acquireTokenSilent({
      scopes: ['User.Read'],
      account: this.msalService.instance.getAllAccounts()[0]
    })).pipe(
      map((result: AuthenticationResult) => result.accessToken),
      catchError((error: Error) => {
        console.error('Error acquiring token:', error);
        return of(null);
      })
    );
  }
} 