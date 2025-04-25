# ESG AI Viewer

A web application for interacting with ESG AI through a chat interface, integrated with n8n workflows.

## Prerequisites

- Node.js 18.x
- Docker and Docker Compose
- Azure CLI
- Azure subscription with AKS cluster access
- kubectl configured with AKS cluster access

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

The ESG AI Viewer can be deployed using the automated batch scripts or manually following the steps below.

### Automated Deployment

#### Stage Deployment
1. **Navigate to BatchScripts Directory**
```bash
cd BatchScripts
```

2. **Run Stage Deployment Script**
```bash
# This will deploy only to the Stage environment
deploy-stage.bat
```

The stage deployment script will:
- Check for required tools (Node.js, npm, Docker, Azure CLI, kubectl)
- Login to Azure and Container Registry
- Build the application for the stage environment
- Create and push Docker image
- Deploy to AKS
- Verify the deployment

#### Production Deployment
1. **Navigate to BatchScripts Directory**
```bash
cd BatchScripts
```

2. **Run Production Deployment Script**
```bash
# This will deploy to the Production environment
deploy-prod.bat
```

The production deployment script will:
- Check for required tools (Node.js, npm, Docker, Azure CLI, kubectl)
- Verify Kubernetes configuration
- Login to Azure and Container Registry
- Build the application for production
- Create and push Docker image
- Deploy to AKS with the following steps:
  - Apply ConfigMap
  - Apply Deployment
  - Apply Service
  - Apply Ingress
- Verify the deployment with:
  - Deployment status
  - Pod status
  - Service status
  - Ingress status
  - TLS certificate status
  - Pod readiness check
  - Application health check

#### Full Deployment (Stage and Production)
```bash
# This will deploy to both Stage and Production environments
deploy-web.bat
```

### Manual Deployment

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

# Check TLS certificate status
kubectl get certificate esg-ai-viewer-tls-prod

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=esg-ai-viewer --timeout=60s

# View logs
kubectl logs -f deployment/esg-ai-viewer
```

## Python Deployment

The Python components of the ESG AI system can be deployed using batch scripts located in the `BatchScripts` directory.

### Prerequisites
- Python 3.x installed and in PATH
- pip package manager
- requirements.txt file in the Python project directory

### Deployment Process

1. **Navigate to BatchScripts Directory**
```bash
cd BatchScripts
```

2. **Run Deployment Script**
```bash
# This will deploy to both Stage and Production environments
deploy.bat
```

The deployment script will:
- Create deployment directories for Stage and Production
- Copy source files from PythonCode/ESGFlat/Python
- Install dependencies from requirements.txt
- Run tests to verify the deployment
- Create the following directory structure:
  ```
  deploy/
  ├── stage/
  │   └── [Python files and dependencies]
  └── production/
      └── [Python files and dependencies]
  ```

### Environment-Specific Deployment

The deployment script handles both Stage and Production environments automatically. Each environment gets its own isolated directory with all necessary files and dependencies.

### Verification

After deployment, you can verify the installation by:
1. Checking the created directories in the `deploy` folder
2. Verifying that all dependencies are installed
3. Running the ESGCompanyWorkflow.py script in each environment

### Troubleshooting

If you encounter issues during deployment:
1. Check that Python and pip are properly installed and in PATH
2. Verify the requirements.txt file exists and is valid
3. Ensure the source directory structure matches the expected paths
4. Check for any error messages in the deployment output

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
   - Verify kubectl is properly configured with AKS
   - Check TLS certificate status if HTTPS issues occur

3. **Deployment Verification Issues**
   - Check pod status and logs for errors
   - Verify ingress configuration matches environment
   - Ensure TLS certificate is properly configured
   - Check network policies if connectivity issues occur
   - Verify health check endpoint is accessible

For support, please contact the development team or create an issue in the repository.
