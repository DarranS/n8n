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

const tenantAuthority = 'https://login.microsoftonline.com/fcc16827-3d82-4edf-9dc2-5d034f97127e';

// Initialize build info
window.__BUILD_TAG__ = 'local-development';

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
    const msalInstance = await MSALInstanceFactory();
    
    await bootstrapApplication(AppComponent, {
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        {
          provide: MSAL_INSTANCE,
          useValue: msalInstance
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useFactory: MSALGuardConfigFactory
        },
        {
          provide: MSAL_INTERCEPTOR_CONFIG,
          useFactory: MSALInterceptorConfigFactory
        },
        MsalService,
        MsalGuard,
        MsalBroadcastService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: MsalInterceptor,
          multi: true
        }
      ]
    });
  } catch (error) {
    console.error('Error bootstrapping application:', error);
  }
}

bootstrap();
