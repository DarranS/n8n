export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // Your API URL for development
  auth: {
    clientId: '200b5caf-1971-4d5c-9d82-2a2b1dadc626',
    authority: 'https://login.microsoftonline.com/fcc16827-3d82-4edf-9dc2-5d034f97127e',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    navigateToLoginRequestUrl: true,
    cacheLocation: 'localStorage',
    scopes: ['user.read', 'openid', 'profile', 'email']
  }
}; 