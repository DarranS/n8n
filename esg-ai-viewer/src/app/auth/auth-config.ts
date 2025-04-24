import { Configuration, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { environment } from '../../environments/environment';

interface AuthConfig {
  auth: {
    clientId: string;
    authority: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
    navigateToLoginRequestUrl: boolean;
  };
}

const tenantId = 'fcc16827-3d82-4edf-9dc2-5d034f97127e';
const tenantAuthority = `https://login.microsoftonline.com/${tenantId}`;

let msalConfig: Configuration;

export async function initializeMsalConfig(): Promise<Configuration> {
  if (msalConfig) {
    return msalConfig;
  }

  try {
    const response = await fetch('/assets/config/config.json');
    const config = await response.json() as AuthConfig;
    
    msalConfig = {
      auth: {
        clientId: config.auth.clientId,
        authority: tenantAuthority,
        redirectUri: config.auth.redirectUri,
        postLogoutRedirectUri: config.auth.postLogoutRedirectUri,
        navigateToLoginRequestUrl: config.auth.navigateToLoginRequestUrl,
        knownAuthorities: ['login.microsoftonline.com'],
        protocolMode: 'AAD'
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: false,
        claimsBasedCachingEnabled: true
      },
      system: {
        loggerOptions: {
          loggerCallback: (level: LogLevel, message: string) => {
            console.log(message);
          },
          logLevel: LogLevel.Verbose,
          piiLoggingEnabled: false
        }
      }
    };
  } catch (error) {
    console.error('Failed to load auth config:', error);
    // Fallback to environment config
    msalConfig = {
      auth: {
        clientId: environment.auth.clientId,
        authority: tenantAuthority,
        redirectUri: environment.auth.redirectUri,
        postLogoutRedirectUri: environment.auth.postLogoutRedirectUri,
        navigateToLoginRequestUrl: true,
        knownAuthorities: ['login.microsoftonline.com'],
        protocolMode: 'AAD'
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: false,
        claimsBasedCachingEnabled: true
      },
      system: {
        loggerOptions: {
          loggerCallback: (level: LogLevel, message: string) => {
            console.log(message);
          },
          logLevel: LogLevel.Verbose,
          piiLoggingEnabled: false
        }
      }
    };
  }

  return msalConfig;
}

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  prompt: 'select_account',
  authority: tenantAuthority,
  extraQueryParameters: {
    domain_hint: 'sheltononline.com'
  }
};

export const protectedResources = {
  graphMe: {
    endpoint: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['User.Read'],
    authority: tenantAuthority
  }
}; 