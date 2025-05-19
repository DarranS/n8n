#!/bin/bash

# Start the development environment
echo "Starting ESG AI Viewer in development mode..."

# Copy development config to runtime config
cp ../config.development.json ../config.json

echo "Development config copied to config.json."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start the containers
docker-compose -f docker-compose.dev.yml up --build

# The application will be available at http://localhost:8080
 