# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build both client and server
RUN npm run build:client && npm run build:server

# Frontend stage
FROM node:20-alpine as frontend

WORKDIR /app

# Copy built assets and production dependencies
COPY --from=builder /app/dist/client ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env* ./

# Install production dependencies only
RUN npm ci --only=production

# Expose dynamic port (will be overridden by environment variable)
EXPOSE 3000

# Start the frontend
CMD ["npm", "run", "preview"]

# Backend stage
FROM node:20-alpine as backend

WORKDIR /app

# Copy built assets and production dependencies
COPY --from=builder /app/dist/server ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env* ./

# Install production dependencies only
RUN npm ci --only=production

# Expose dynamic port (will be overridden by environment variable)
EXPOSE 3001

# Start the backend
CMD ["node", "dist/index.js"] 