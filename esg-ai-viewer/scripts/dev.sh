#!/bin/bash

# Start the development environment
echo "Starting ESG AI Viewer in development mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start the containers
docker-compose -f docker-compose.dev.yml up --build

# The application will be available at http://localhost:8080
 