/// <reference path="./types/global.d.ts" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalGuard, MsalInterceptor, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation } from '@azure/msal-browser';
import { initializeMsalConfig } from './app/auth/auth-config';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { appConfig } from './app/app.config';

const tenantAuthority = 'https://login.microsoftonline.com/fcc16827-3d82-4edf-9dc2-5d034f97127e';

export async function MSALInstanceFactory(): Promise<IPublicClientApplication> {
  const config = await initializeMsalConfig();
  config.auth.knownAuthorities = ['login.microsoftonline.com'];
  config.auth.authority = tenantAuthority;
  config.auth.redirectUri = window.location.origin;
  config.auth.navigateToLoginRequestUrl = true;
  config.cache = {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false,
    claimsBasedCachingEnabled: true
  };
  const msalInstance = new PublicClientApplication(config);
  await msalInstance.initialize();
  return msalInstance;
}

export function MSALGuardConfigFactory() {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['User.Read', 'openid', 'profile', 'email'],
      authority: tenantAuthority,
      redirectUri: window.location.origin,
      extraQueryParameters: {
        domain_hint: 'sheltononline.com'
      }
    }
  };
}

export function MSALInterceptorConfigFactory() {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      ['https://graph.microsoft.com/v1.0/me', {
        scopes: ['User.Read'],
        authority: tenantAuthority,
        extraQueryParameters: {
          domain_hint: 'sheltononline.com'
        }
      }]
    ])
  };
}

async function bootstrap() {
  try {
    await bootstrapApplication(AppComponent, appConfig);
  } catch (error) {
    console.error('Error bootstrapping application:', error);
  }
}

bootstrap();
