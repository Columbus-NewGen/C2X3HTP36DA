# Stage 1: Build stage
FROM node:lts-alpine AS builder

# Install corepack (handle yarn conflict) and enable it
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy .env file (must be before build so Vite can use it)
COPY .env ./

# Copy source code
COPY . .

# Build the application
# Vite will bake environment variables (VITE_*) into the build
RUN pnpm build

# Stage 2: Production stage with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy .env file to the nginx server (for reference/runtime if needed)
COPY --from=builder /app/.env /usr/share/nginx/html/.env

# Expose port 4000
EXPOSE 4000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

