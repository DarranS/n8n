# ESG AI Viewer

A web application for interacting with ESG AI through a chat interface, integrated with n8n workflows.

## Prerequisites

- Node.js 18.x
- Docker and Docker Compose
- Azure CLI
- Azure subscription with AKS cluster access

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

### 1. Prepare Kubernetes Manifests
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

# Apply manifests
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

## Support

For support, please contact the development team or create an issue in the repository.
