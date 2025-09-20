# Multi-stage Dockerfile for Vite React app (production)

# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application and build
COPY . .
RUN npm run build

# 2) Run stage with Nginx
FROM nginx:1.25-alpine AS runner

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
