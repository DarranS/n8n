# ESG AI Viewer

A web application for interacting with ESG AI through a chat interface, integrated with n8n workflows.

## Prerequisites

- Node.js 18.x
- Docker and Docker Compose
- Azure CLI
- Azure subscription with AKS cluster access

## Environment Configuration Management

### Configuration Files

The application uses environment-specific configuration files located in `src/assets/config/`:

- `config.development.json` - Development environment
- `config.staging.json` - Staging environment
- `config.production.json` - Production environment

Each environment has its own Azure AD client ID and redirect URIs:

### Development Environment
```json
{
  "auth": {
    "clientId": "0b1db0b1-d35d-441b-aa4f-4cdcfeff0691",
    "authority": "https://login.microsoftonline.com/fcc16827-3d82-4edf-9dc2-5d034f97127e",
    "redirectUri": "http://localhost:8080",
    "postLogoutRedirectUri": "http://localhost:8080"
  }
}
```

### Staging Environment
```json
{
  "auth": {
    "clientId": "7425393c-f84e-435c-83e5-c76aec2230c4",
    "authority": "https://login.microsoftonline.com/fcc16827-3d82-4edf-9dc2-5d034f97127e",
    "redirectUri": "https://stage-esgaiviewer.sheltononline.com",
    "postLogoutRedirectUri": "https://stage-esgaiviewer.sheltononline.com"
  }
}
```

### Production Environment
```json
{
  "auth": {
    "clientId": "200b5caf-1971-4d5c-9d82-2a2b1dadc626",
    "authority": "https://login.microsoftonline.com/fcc16827-3d82-4edf-9dc2-5d034f97127e",
    "redirectUri": "https://esgaiviewer.sheltononline.com",
    "postLogoutRedirectUri": "https://esgaiviewer.sheltononline.com"
  }
}
```

### Running Different Environments

The application can be run in different environments using npm scripts:

- Development: `npm start`
- Staging: `npm run start:stage`
- Production: `npm run start:prod`

### Building for Deployment

To build the application for different environments:

- Development build: `npm run build`
- Staging build: `npm run build:stage`
- Production build: `npm run build:prod`

### How Configuration Works

The environment-specific configuration is managed through Angular's file replacement feature. During the build process, Angular will automatically replace the base `config.json` with the appropriate environment-specific version based on the build configuration.

This is configured in `angular.json` using the `fileReplacements` property:

```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/assets/config/config.json",
          "with": "src/assets/config/config.production.json"
        }
      ]
    }
  }
}
```

### Important Configuration Notes

1. Always use the correct npm script for your target environment
2. The configuration files contain sensitive information (client IDs) and should be handled securely
3. Each environment has its own Azure AD application registration
4. Make sure the redirect URIs are configured correctly in the Azure AD application registrations

## Azure AD App Registration Setup

### 1. Create App Registration
```powershell
# Login to Azure
az login

# Create App Registration
az ad app create --display-name "ESG AI Viewer" --web-redirect-uris "http://localhost:8080" --enable-id-token-issuance true

# Note the Application (client) ID from the output
```

### 2. Configure Authentication
1. Go to Azure Portal > Azure Active Directory > App Registrations
2. Select your app registration
3. Under "Authentication":
   - Add platform: Single-page application
   - Add redirect URI: http://localhost:8080
   - Enable ID tokens
   - Save changes

### 3. Configure API Permissions
1. Under "API Permissions":
   - Add Microsoft Graph > User.Read
   - Grant admin consent

## Local Docker Development Setup

### 1. Build and Run (Make Sure Docker Desktop is running)
```bash
# For development
docker-compose -f docker-compose.dev.yml up --build

# For staging
docker-compose -f docker-compose.stage.yml up --build

# For production
docker-compose -f docker-compose.prod.yml up --build
```

### 2. Access the Application
- Development: http://localhost:8080
- Staging: http://localhost:8080
- Production: http://localhost:8080

### 3. View Logs
```bash
# View container logs
docker-compose -f docker-compose.<env>.yml logs -f

# View Nginx logs
tail -f ./logs/error.log
tail -f ./logs/access.log
```

## AKS Deployment

### 1. Login to Azure and Container Registry
```bash
# Login to Azure
az login

# Login to Azure Container Registry
az acr login --name esgai

# 1. Build the production image
docker build -t esg-ai-viewer:latest .

# 2. Tag the image with your Azure Container Registry
docker tag esg-ai-viewer:latest esgai.azurecr.io/esg-ai-viewer:latest

# 3. Push to Azure Container Registry
docker push esgai.azurecr.io/esg-ai-viewer:latest
```

### 2. Deploy to AKS
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/config.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 3. Verify Deployment
```bash
# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress

# View logs
kubectl logs -f deployment/esg-ai-viewer
```

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   - Verify Azure AD app registration settings
   - Check redirect URIs match exactly
   - Ensure proper CORS configuration
   - Clear browser cache and cookies
   - Try incognito/private window

2. **Production Build Issues**
   - Ensure logged in to Azure Container Registry
   - Check image tag matches exactly
   - Verify Docker Desktop is running
   - Check network connectivity to Azure

For support, please contact the development team or create an issue in the repository.
