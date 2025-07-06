# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl dumb-init

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application (now tsc will be available)
RUN npm run build

# Remove dev dependencies after building to reduce image size
RUN npm prune --production

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]