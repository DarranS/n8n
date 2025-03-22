Deployment of N8n to Azure AKS. Based on Docs and added HTTPS
## Deploying n8n on AKS with `kubectl`

This section provides the essential `kubectl` commands to deploy and monitor the n8n application on your Azure Kubernetes Service (AKS) cluster. Ensure you have the following prerequisites:
- An AKS cluster set up and running.
- `kubectl` installed and configured to connect to your AKS cluster (e.g., via `az aks get-credentials --resource-group <resource-group> --name <cluster-name>`).
- The `n8n-kubernetes-hosting` directory cloned from this repository.

### 1. Deploy the Resources
Navigate to the `n8n-kubernetes-hosting` directory containing the Kubernetes manifests:
```bash
cd n8n-kubernetes-hosting


1. Apply the manifests to deploy n8n and its dependencies (PostgreSQL, ingress, etc.):

kubectl apply -f postgres-secret.yaml  # Deploy the PostgreSQL secret
kubectl apply -f n8n-deployment.yaml  # Deploy the n8n application
kubectl apply -f n8n-service.yaml     # Expose n8n internally
kubectl apply -f cluster-issuer.yaml  # Set up the cluster issuer for TLS (if using cert-manager)
kubectl apply -f n8n-ingress.yaml     # Expose n8n externally via an ingress


OR Alternatively, apply all manifests at once:
kubectl apply -f .


2. Verify the Deployment
Check the status of the deployed resources to ensure everything is running correctly.

Check Pods
List all pods in the namespace (replace <namespace> with your namespace, e.g., default if not specified):

kubectl get pods -n <namespace>

Check Deployments
Verify that the deployments are available:

kubectl get deployments -n <namespace>

Check Services
Confirm that the services are created and have the correct type (e.g., ClusterIP for internal, or LoadBalancer if applicable):

kubectl get services -n <namespace>


Check Ingress
Verify that the ingress is set up and has an external address (if using an ingress controller):

kubectl get ingress -n <namespace>

Check Secrets
Ensure the PostgreSQL secret is created:

kubectl get secrets -n <namespace>


Check Cluster Issuer (If Using cert-manager)
If you’re using cluster-issuer.yaml for TLS certificates, verify the cluster issuer:

kubectl get clusterissuer


. Access the n8n Application
Once the ingress has an address, you can access n8n using the hostname specified in n8n-ingress.yaml (e.g., n8n.example.com). Open it in your browser:

https://n8n.example.com
https://n8n.sheltononline.com/signin


4. Monitor Logs
Check the logs of the n8n pod for debugging:
kubectl logs -n <namespace> -l app=postgres

5. Troubleshooting
Describe Resources
Get detailed information about a resource if it’s not working as expected:

kubectl describe pod -n <namespace> <pod-name>
kubectl describe ingress -n <namespace> n8n-ingress

Check Events
View cluster events for errors or warnings:

kubectl get events -n <namespace>


Delete Resources (For Cleanup)
To remove the deployed resources:

kubectl delete -f . -n <namespace>