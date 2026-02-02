# Environment Configuration Guide

## Overview

The Primis Backend supports multiple environment configurations for development and production deployments.

## Environment Files

### `.env` (Default)
Base configuration file used as fallback. Contains development settings by default.

### `.env.development`
Development environment configuration for local development.

### `.env.production`
Production environment configuration for deployment.

## Environment Variables

### Server Configuration
- `NODE_ENV`: Environment mode (`development` or `production`)
- `PORT`: Server port (default: 3000)

### AWS Configuration
- `AWS_REGION`: AWS region for services (default: us-east-1)

### Database Configuration
- `DB_HOST`: Database host address
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_SSL`: Enable SSL connection (`true` or `false`)
- `DB_SSL_REJECT_UNAUTHORIZED`: Reject unauthorized SSL certificates (`true` or `false`)

### MQTT Configuration
- `MQTT_BROKER_URL`: MQTT broker connection URL
- `MQTT_USERNAME`: MQTT broker username (optional)
- `MQTT_PASSWORD`: MQTT broker password (optional)

## Usage

### Development Mode

```bash
npm run dev
```
Loads `.env.development` configuration.

### Production Mode

```bash
npm run dev:prod
```
Loads `.env.production` configuration in development mode.

```bash
npm run build
npm start
```
Builds and runs with `.env.production` configuration.

### Debug Mode

```bash
npm run debug
```
Runs in debug mode with development configuration.

## Setup Instructions

### Development Setup

1. Copy `.env.development` to `.env` (optional, for local customization):
   ```bash
   cp .env.development .env
   ```

2. Update database credentials in `.env.development`:
   ```env
   DB_HOST=localhost
   DB_PORT=5433
   DB_USER=postgres
   DB_PASSWORD=your-local-password
   DB_NAME=primisdb
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Production Setup

1. Update `.env.production` with your production credentials:
   ```env
   DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your-secure-password
   DB_NAME=primisdb
   DB_SSL=true
   ```

2. Update MQTT broker settings:
   ```env
   MQTT_BROKER_URL=mqtt://your-mqtt-broker.com:1883
   MQTT_USERNAME=your-username
   MQTT_PASSWORD=your-password
   ```

3. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

## Database Configuration

### Development (Local PostgreSQL)

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=primisdb
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=false
```

### Production (AWS RDS)

```env
DB_HOST=primis-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=strong-production-password
DB_NAME=primisdb
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

## Security Best Practices

### 1. Never Commit Sensitive Data

Add to `.gitignore`:
```
.env
.env.local
.env.development
.env.production
.env.*.local
```

### 2. Use Strong Passwords

- Use complex passwords for production databases
- Rotate credentials regularly
- Use AWS Secrets Manager for production secrets

### 3. SSL Configuration

- Always enable SSL in production (`DB_SSL=true`)
- Use proper SSL certificates
- Set `DB_SSL_REJECT_UNAUTHORIZED=true` with valid certificates

### 4. Environment-Specific Settings

Keep development and production configurations separate:
- Different database instances
- Different MQTT brokers
- Different AWS resources

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database

**Solutions**:
1. Verify database credentials in env file
2. Check database host and port accessibility
3. Ensure SSL settings match database requirements
4. Check firewall rules and security groups

### Environment Not Loading

**Problem**: Wrong environment configuration loaded

**Solutions**:
1. Verify `NODE_ENV` is set correctly
2. Check env file exists (`.env.development` or `.env.production`)
3. Restart the application after changing env files

### SSL Certificate Errors

**Problem**: SSL certificate validation failures

**Solutions**:
1. Set `DB_SSL_REJECT_UNAUTHORIZED=false` for self-signed certificates
2. Install proper SSL certificates for production
3. Verify RDS certificate bundle is available

## Docker Configuration

Example `docker-compose.yml` for different environments:

### Development
```yaml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - NODE_ENV=development
    env_file:
      - .env.development
    ports:
      - "3000:3000"
```

### Production
```yaml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    ports:
      - "3000:3000"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Create .env.production
        run: |
          echo "NODE_ENV=production" >> .env.production
          echo "DB_HOST=${{ secrets.DB_HOST }}" >> .env.production
          echo "DB_PASSWORD=${{ secrets.DB_PASSWORD }}" >> .env.production

      - name: Build and Deploy
        run: |
          npm install
          npm run build
```

## Monitoring

Monitor environment-specific metrics:
- Database connection pool usage
- MQTT broker connectivity
- API response times per environment
- Error rates by environment

## Migration Between Environments

When migrating from development to production:

1. **Database**: Export development schema, import to production
2. **Credentials**: Update all passwords and API keys
3. **DNS**: Update MQTT broker and database endpoints
4. **SSL**: Enable and configure SSL certificates
5. **Testing**: Thoroughly test in staging before production

## Summary

- Use `.env.development` for local development
- Use `.env.production` for production deployment
- Never commit sensitive credentials
- Always use SSL in production
- Keep environment files synchronized with database.ts configuration
