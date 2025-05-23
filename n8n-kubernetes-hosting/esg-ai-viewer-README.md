# ESG AI Viewer Kubernetes Deployment

This directory contains the Kubernetes manifests for deploying the ESG AI Viewer application to AKS.

## Prerequisites

1. Azure Kubernetes Service (AKS) cluster is set up and running
2. `kubectl` is installed and configured to connect to your AKS cluster
3. NGINX Ingress Controller is installed
4. cert-manager is installed for SSL certificate management
5. Azure Container Registry (ACR) is set up and accessible

## Push Docker Image to Azure Container Registry

1. Log in to Azure CLI and your Azure Container Registry:
   ```bash
   az login
   az acr login --name <your-acr-name>
   ```

2. Tag your local Docker image (from the esg-ai-viewer directory):
   ```bash
   docker tag esg-ai-viewer:latest <your-acr-name>.azurecr.io/esg-ai-viewer:latest
   ```

3. Push the image to ACR:
   ```bash
   docker push <your-acr-name>.azurecr.io/esg-ai-viewer:latest
   ```

4. Update the deployment YAML to use the ACR image:
   ```bash
   # Edit esg-ai-viewer-deployment.yaml and update the image field to:
   image: <your-acr-name>.azurecr.io/esg-ai-viewer:latest
   ```

5. Ensure AKS has access to ACR:
   ```bash
   az aks update -n <your-aks-cluster-name> -g <your-resource-group> --attach-acr <your-acr-name>
   ```

## Deployment Steps

1. First, ensure you're connected to your AKS cluster:
   ```bash
   az aks get-credentials --resource-group <your-resource-group> --name <your-cluster-name>
   ```

2. Make sure you're in the correct namespace:
   ```bash
   kubectl config set-context --current --namespace=n8n
   ```

3. Deploy the application:
   ```bash
   kubectl apply -f esg-ai-viewer-deployment.yaml
   kubectl apply -f esg-ai-viewer-service.yaml
   kubectl apply -f esg-ai-viewer-ingress.yaml
   ```

4. Verify the deployment:
   ```bash
   kubectl get pods -l app=esg-ai-viewer
   kubectl get service esg-ai-viewer
   kubectl get ingress esg-ai-viewer-ingress
   ```

## DNS Configuration

Ensure that your domain `ESGAIViewer.SheltonOnline.com` is pointed to your AKS cluster's ingress controller external IP address.

To get the ingress controller IP:
```bash
kubectl get service -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## SSL Certificate

The application is configured to use Let's Encrypt for SSL certificates. The certificate will be automatically provisioned when the ingress resource is created.

To check the certificate status:
```bash
kubectl get certificate -n n8n
```

## Troubleshooting

1. Check pod status:
   ```bash
   kubectl describe pod -l app=esg-ai-viewer
   ```

2. Check ingress status:
   ```bash
   kubectl describe ingress esg-ai-viewer-ingress
   ```

3. View application logs:
   ```bash
   kubectl logs -l app=esg-ai-viewer
   ```

4. Check image pull status:
   ```bash
   kubectl describe pod -l app=esg-ai-viewer | grep -A 5 "Events:"
   ``` 