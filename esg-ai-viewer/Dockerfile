# Build stage
FROM node:18-alpine as build
WORKDIR /app

# Add build arguments early
ARG ENVIRONMENT=development

COPY package*.json ./
RUN npm install
COPY . .

# Build the application using the environment (lowercase)
RUN npm run build -- --configuration=$(echo ${ENVIRONMENT} | tr '[:upper:]' '[:lower:]') --aot=true

# Serve stage
FROM nginx:alpine

# Pass build information to runtime
ARG BUILD_TAG
ARG ENVIRONMENT
ENV BUILD_TAG=${BUILD_TAG:-"not set"}
ENV ENVIRONMENT=${ENVIRONMENT:-"Development"}
ENV PORT=8080

# Copy the built app and configuration
COPY --from=build /app/dist/esg-ai-viewer /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Create log directories and set permissions
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/error.log /var/log/nginx/access.log /var/log/nginx/webhook_error.log /var/log/nginx/webhook_access.log && \
    chown -R nginx:nginx /var/log/nginx

EXPOSE 8080

# Use our custom entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"] 