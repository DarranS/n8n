# ESG AI Viewer

A web application for interacting with ESG AI through a chat interface, integrated with n8n workflows.

---

## Prerequisites

- **Node.js 18.x** (recommended for compatibility with Angular 19)
- **npm** (comes with Node.js)
- **Docker and Docker Compose**
- **Azure CLI**
- **Azure subscription with AKS cluster access**

---

## Project Structure

- `src/app/` — Main Angular application code
  - `components/` — Reusable UI components (tabs, chat, company-selector, header)
  - `pages/` — Main application pages (about, chat, links, public-home, research-home, weather)
  - `services/` — Angular services for business logic and API calls
  - `auth/` — Authentication logic and guards
  - `header/` — Header component
  - `home/` — Home page
- `src/assets/config/` — Environment-specific JSON config files
- `src/environments/` — Angular environment files
- `src/types/` — TypeScript type definitions

---

## Environment Configuration

The app uses both `.env` files (for backend/deployment) and JSON config files in `src/assets/config/` (for frontend runtime config). Update these as needed for your environment.

### Example: Development Environment (`src/assets/config/config.development.json`)
```json
{
  "apiBaseUrl": "http://localhost:3000/api",
  "n8nWebhookUrl": "https://n8n.sheltononline.com/webhook/"
}
```

---

## Installing Dependencies

```bash
cd esg-ai-viewer
npm install
```

---

## Running the Application

### Development
```bash
npm start
# or
ng serve --configuration=development --port 4201 --proxy-config proxy.conf.json
```

### Staging
```bash
npm run start:stage
```

### Production
```bash
npm run start:prod
```

---

## Building the Application

- **Development:** `npm run build`
- **Staging:** `npm run build:stage`
- **Production:** `npm run build:prod`

---

## Running Tests

```bash
npm test
```

---

## NPM Scripts

- `start` — Start dev server (development config)
- `start:prod` — Start dev server (production config)
- `start:stage` — Start dev server (staging config)
- `build` — Build app (development)
- `build:prod` — Build app (production)
- `build:stage` — Build app (staging)
- `test` — Run unit tests

---

## Code Quality & Refactoring

- **Component Size:** Large components (e.g., header, links) should be split into smaller subcomponents if possible.
- **Service Size:** Large services (e.g., esg.service.ts) should be split by domain.
- **Type Safety:** Centralize and expand TypeScript types in `src/types/`.
- **Duplication:** Abstract repeated logic in tabs/components into base classes or utilities.
- **SCSS:** Modularize large SCSS files and use Angular's style encapsulation.
- **Error Handling:** Ensure robust error handling for all API calls.
- **Accessibility:** Use ARIA labels, keyboard navigation, and check color contrast.
- **Performance:** Use OnPush change detection where possible.

---

## Updating Dependencies

Periodically run:
```bash
npm outdated
npm update
```

---

## Contributing

- Follow Angular and TypeScript best practices.
- Use consistent code style (see `.editorconfig` or project conventions).
- Write unit tests for new features/components.
- Document complex logic with inline comments.

---

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

## Environment Configuration

### Development Environment (.env.dev)
```
NODE_ENV=development
PORT=8080
AZURE_CLIENT_ID=<your-client-id>
AZURE_TENANT_ID=<your-tenant-id>
AZURE_REDIRECT_URI=http://localhost:8080
N8N_WEBHOOK_URL=https://n8n.sheltononline.com/webhook/
```

### Staging Environment (.env.stage)
```
NODE_ENV=staging
PORT=8080
AZURE_CLIENT_ID=<your-client-id>
AZURE_TENANT_ID=<your-tenant-id>
AZURE_REDIRECT_URI=http://localhost:8080
N8N_WEBHOOK_URL=https://n8n.sheltononline.com/webhook/
```

### Production Environment (.env.prod)
```
NODE_ENV=production
PORT=8080
AZURE_CLIENT_ID=<your-client-id>
AZURE_TENANT_ID=<your-tenant-id>
AZURE_REDIRECT_URI=https://your-production-url
N8N_WEBHOOK_URL=https://n8n.sheltononline.com/webhook/
```

## Docker Development and Deployment

### Local Development
```bash
# For development
docker-compose -f docker-compose.dev.yml up --build

# For staging
docker-compose -f docker-compose.stage.yml up --build

# For production testing
docker-compose -f docker-compose.prod.yml up --build
```

### Production Deployment to Azure Container Registry
```bash
# Login to Azure
az login

# Login to Azure Container Registry
az acr login --name your-registry

# 1. Build the production image
docker build -t esg-ai-viewer:latest .

# 2. Tag the image with your Azure Container Registry
docker tag esg-ai-viewer:latest your-registry.azurecr.io/esg-ai-viewer:latest

# 3. Push to Azure Container Registry
docker push your-registry.azurecr.io/esg-ai-viewer:latest
```

### Access the Application
- Development: http://localhost:8080
- Staging: http://localhost:8080
- Production: https://your-production-url

### View Logs
```bash
# View container logs
docker-compose -f docker-compose.<env>.yml logs -f

# View Nginx logs
tail -f ./logs/error.log
tail -f ./logs/access.log
```

## AKS Deployment

### 1. Prepare Kubernetes CompanyUniverse Files
Create the following files in the `k8s` directory:

#### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: esg-ai-viewer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: esg-ai-viewer
  template:
    metadata:
      labels:
        app: esg-ai-viewer
    spec:
      containers:
      - name: esg-ai-viewer
        image: your-registry.azurecr.io/esg-ai-viewer:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        - name: AZURE_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: esg-ai-secrets
              key: azure-client-id
        - name: AZURE_TENANT_ID
          valueFrom:
            secretKeyRef:
              name: esg-ai-secrets
              key: azure-tenant-id
        - name: AZURE_REDIRECT_URI
          value: "https://your-production-url"
```

#### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: esg-ai-viewer
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: esg-ai-viewer
```

#### ingress.yaml
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: esg-ai-viewer
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-production-url
    secretName: esg-ai-viewer-tls
  rules:
  - host: your-production-url
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: esg-ai-viewer
            port:
              number: 80
```

### 2. Deploy to AKS
```bash
# Login to Azure
az login

# Login to ACR
az acr login --name your-registry

# Build and push image
docker build -t your-registry.azurecr.io/esg-ai-viewer:latest .
docker push your-registry.azurecr.io/esg-ai-viewer:latest

# Create secrets
kubectl create secret generic esg-ai-secrets \
  --from-literal=azure-client-id=<your-client-id> \
  --from-literal=azure-tenant-id=<your-tenant-id>

# Apply CompanyUniverse files
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

1. **502 Bad Gateway**
   - Check Nginx logs: `docker-compose logs -f`
   - Verify n8n webhook URL is correct
   - Check network connectivity

2. **Authentication Issues**
   - Verify Azure AD app registration settings
   - Check redirect URIs match exactly
   - Ensure proper CORS configuration

3. **Docker Issues**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild images: `docker-compose build --no-cache`
   - Check port conflicts

4. **Production Build Issues**
   - Make sure you're logged into Azure Container Registry
   - Check image tags match exactly
   - Verify Docker Desktop is running
   - Check network connectivity to Azure

## Support

For support, please contact the development team or create an issue in the repository.

---

## Company Data CompanyUniverse Process

### Dynamic Company Picker
- The company picker and related features dynamically load company data files based on a CompanyUniverse file: `src/assets/data/CompanyUniverse.json`.
- This CompanyUniverse lists all available company JSON files in the `src/assets/data` directory.

### Keeping the CompanyUniverse Up to Date
- **Whenever you add or remove company data files, you must update the CompanyUniverse.**
- Use the provided PowerShell script to regenerate the CompanyUniverse:
  ```powershell
  cd BatchScripts
  ./generate-CompanyUniverse.ps1
  ```
- The script scans all `.json` files (except `CompanyUniverse.json` itself) in `src/assets/data` and writes the updated list to `CompanyUniverse.json`.
- The app will then load all companies listed in the CompanyUniverse.

### Technical Details
- The CompanyUniverse is required because Angular apps cannot enumerate files in the assets directory at runtime.
- The script can be ported to other scripting languages if needed for different environments.
- If the CompanyUniverse is missing or out of date, the company picker will not show all available companies.

### Troubleshooting
- If a company does not appear in the picker:
  1. Ensure its `.json` file is present in `src/assets/data`.
  2. Regenerate the CompanyUniverse using the script above.
  3. Refresh/restart the Angular app if needed. 