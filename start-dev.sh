#!/bin/bash

echo "🚀 Starting Frontend Local Development Environment"
echo "=================================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create network if it doesn't exist
docker network create ags_network 2>/dev/null || true

echo "📦 Building and starting frontend development container..."

# Stop existing container if running
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Build and start the development container
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Frontend development server should be available at http://localhost:3000"
echo "🔧 Changes to src/ files will automatically reload the page"
echo "🛑 Press Ctrl+C to stop the development server"
