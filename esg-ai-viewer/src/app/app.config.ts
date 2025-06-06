import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { BuildInfoService } from './services/build-info.service';
import { ConfigService } from './services/config.service';
import { MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalGuard, MsalInterceptor, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, ProtocolMode } from '@azure/msal-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { inject } from '@angular/core';

const tenantAuthority = 'https://login.microsoftonline.com/fcc16827-3d82-4edf-9dc2-5d034f97127e';

export function MSALInstanceFactory(): IPublicClientApplication {
  const configService = inject(ConfigService);
  const config = configService.getConfig();
  if (!config) {
    throw new Error('Config not loaded!');
  }
  return new PublicClientApplication({
    auth: {
      clientId: config.auth.clientId,
      authority: config.auth.authority,
      redirectUri: config.auth.redirectUri,
      postLogoutRedirectUri: config.auth.postLogoutRedirectUri,
      navigateToLoginRequestUrl: config.auth.navigateToLoginRequestUrl,
      knownAuthorities: ['login.microsoftonline.com']
    },
    cache: {
      cacheLocation: config.auth.cacheLocation || 'localStorage',
      storeAuthStateInCookie: false,
      claimsBasedCachingEnabled: true
    },
    system: {
      loggerOptions: {
        loggerCallback: (level: any, message: string) => {
          // Remove: console.log(message);
        },
        logLevel: 2, // LogLevel.Verbose
        piiLoggingEnabled: false
      }
    }
  });
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

export function loadAppConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    BuildInfoService,
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadAppConfig,
      deps: [ConfigService],
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
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
};
