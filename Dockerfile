# Build stage
FROM node:20.17.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json package-lock.json ./
# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:latest

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]