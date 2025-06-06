/// <reference path="./types/global.d.ts" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalGuard, MsalInterceptor, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation } from '@azure/msal-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { appConfig } from './app/app.config';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

export function MSALGuardConfigFactory() {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['User.Read', 'openid', 'profile', 'email'],
      authority: 'https://login.microsoftonline.com/fcc16827-3d82-4edf-9dc2-5d034f97127e',
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
        authority: 'https://login.microsoftonline.com/fcc16827-3d82-4edf-9dc2-5d034f97127e',
        extraQueryParameters: {
          domain_hint: 'sheltononline.com'
        }
      }]
    ])
  };
}

async function bootstrap() {
  try {
    ModuleRegistry.registerModules([AllCommunityModule]);
    await bootstrapApplication(AppComponent, appConfig);
  } catch (error) {
    console.error('Error bootstrapping application:', error);
  }
}

bootstrap();
