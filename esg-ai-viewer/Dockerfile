# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV=production
RUN npm run build --configuration=production

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist/esg-ai-viewer /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create log directories and set permissions
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/error.log /var/log/nginx/access.log /var/log/nginx/webhook_error.log /var/log/nginx/webhook_access.log && \
    chown -R nginx:nginx /var/log/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 