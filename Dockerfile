
# Stage 1: Build the React/TypeScript application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Set up the production environment with Node.js and SQLite
FROM node:18-alpine

WORKDIR /app

# Install SQLite and other production dependencies
RUN apk --no-cache add sqlite

# Copy built files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.cjs ./server.cjs
COPY --from=build /app/package*.json ./

# Install production dependencies, including sqlite3
RUN npm ci --only=production && \
    npm install sqlite3@latest

# Create directory for SQLite DB and make it writable
RUN mkdir -p /data
ENV DATABASE_PATH=/data/database.sqlite
VOLUME /data

# Expose the port the server is running on
EXPOSE 3001

# Command to run the server with proper file extension
CMD ["node", "server.cjs"]
