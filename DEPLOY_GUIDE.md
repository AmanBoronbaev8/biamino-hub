
# Biamino Project Hub Deployment Guide

This guide will help you deploy the Biamino Project Hub application, including the SQLite database server.

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn package manager
- Git

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Install Server Dependencies

The server requires the following dependencies:

```bash
npm install express cors sqlite3 sqlite
# or
yarn add express cors sqlite3 sqlite
```

### 4. Build the Frontend

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the built frontend assets.

### 5. Start the Server

For development:

```bash
node server.js
```

For production, it's recommended to use a process manager like PM2:

```bash
# Install PM2 globally if not already installed
npm install -g pm2
# or
yarn global add pm2

# Start the server with PM2
pm2 start server.js --name "biamino-project-hub"

# Make PM2 auto-start on system boot
pm2 startup
pm2 save
```

### 6. Access the Application

The application will be available at:

- `http://localhost:3001` (or your configured port)

If you're deploying to a server with a domain name:

1. Point your domain to the server's IP address
2. Update your firewall settings to allow traffic on port 3001 (or your configured port)
3. Consider setting up a reverse proxy (like Nginx) to route traffic from port 80/443 to your application

## Database Management

The SQLite database file (`database.sqlite`) will be automatically created when the server starts. It will be initialized with default data if it's a fresh installation.

### Backup

To backup the database:

```bash
cp database.sqlite database.sqlite.backup
```

### Restore

To restore from a backup:

```bash
cp database.sqlite.backup database.sqlite
```

## Troubleshooting

- If you see "EADDRINUSE" errors, another process is using the configured port. Change the port in server.js.
- If database errors occur, check file permissions for the directory where database.sqlite is stored.
- For any other issues, check the server logs.

## Security Considerations

For production deployment:

1. Set up HTTPS using a reverse proxy like Nginx
2. Configure proper authentication for admin features
3. Regularly backup the SQLite database file
4. Update dependencies to patch security vulnerabilities
