# Use official Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy TypeScript config
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Install dev dependencies for build
RUN npm install --save-dev typescript @types/node @types/express @types/cors

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Create cache directory
RUN mkdir -p /tmp/cache

# Expose port
EXPOSE 3000

# Set environment variable defaults
ENV NODE_ENV=production
ENV PORT=3000
ENV CACHE_DIR=/tmp/cache

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/status', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]