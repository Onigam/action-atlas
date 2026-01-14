# Railway Deployment Setup Guide

This guide explains how to configure GitHub secrets for automatic Railway deployments.

## Required GitHub Secrets

Add these secrets in your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

### 1. Railway Configuration

| Secret Name | Description | How to Get |
|------------|-------------|-----------|
| `RAILWAY_TOKEN` | Railway API token for deployments | Railway Dashboard → Settings → Tokens → Create Token |
| `RAILWAY_SERVICE_NAME` | Name of your Railway service (optional) | Defaults to 'action-atlas' if not set |

### 2. Database Configuration

| Secret Name | Description | Example |
|------------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://username:password@cluster.mongodb.net/actionatlas` |
| `REDIS_URL` | Redis connection URL (optional) | `redis://default:password@host:port` |

### 3. API Keys

| Secret Name | Description | How to Get |
|------------|-------------|-----------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings | https://platform.openai.com/api-keys |
| `GOOGLE_API_KEY` | Google AI API key (Gemini) | https://makersuite.google.com/app/apikey |

### 4. Application Configuration

| Secret Name | Description | Example | Required |
|------------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Public API URL for your app | `https://your-app.railway.app` | Yes |
| `NEXT_PUBLIC_ENABLE_SEARCH` | Enable search feature | `true` | No (default: true) |
| `NEXT_PUBLIC_ENABLE_GEOSPATIAL` | Enable geospatial features | `true` | No (default: true) |
| `LOG_LEVEL` | Logging level | `info` | No (default: info) |
| `RATE_LIMIT_RPM` | Rate limit requests per minute | `20` | No (default: 20) |

## Setup Steps

1. **Get your Railway token:**
   ```bash
   # Login to Railway
   railway login

   # Create a new token in Railway dashboard
   # Settings → Tokens → Create Token
   ```

2. **Add secrets to GitHub:**
   - Go to your repository on GitHub
   - Navigate to **Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   - Add each secret from the tables above

3. **MongoDB Atlas Setup:**
   - Create a MongoDB Atlas cluster if you haven't
   - Get your connection string from Atlas dashboard
   - Add it as `MONGODB_URI` secret
   - Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/actionatlas`

4. **Deploy:**
   - Once all secrets are added, merge the PR
   - The workflow will automatically run on the next push to main
   - Check Railway dashboard to verify deployment

## Troubleshooting

### Deployment fails with "Unauthorized"
- Verify `RAILWAY_TOKEN` is set correctly
- Token may have expired, generate a new one

### Database connection errors
- Check `MONGODB_URI` format
- Verify MongoDB Atlas network access (allow Railway IPs)
- Ensure database user has correct permissions

### Missing environment variables
- Check all required secrets are added to GitHub
- Variable names must match exactly (case-sensitive)

## Notes

- `NODE_ENV` is automatically set to `production` during deployment
- Optional secrets will use default values if not provided
- Public variables (`NEXT_PUBLIC_*`) are embedded at build time
- Secrets are encrypted and never exposed in logs
