# Complete Guide: Deploying Vibe Kanban on Oracle Cloud Free Tier with GitHub Actions Integration

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Oracle Cloud Setup](#oracle-cloud-setup)
3. [VM Configuration](#vm-configuration)
4. [Vibe Kanban Deployment](#vibe-kanban-deployment)
5. [GitHub Actions Runner Setup](#github-actions-runner-setup)
6. [Nginx Reverse Proxy with SSL](#nginx-reverse-proxy-with-ssl)
7. [GitHub Integration](#github-integration)
8. [Bidirectional Sync Implementation](#bidirectional-sync-implementation)
9. [Security Hardening](#security-hardening)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account with admin access to your repository
- Valid email address for Let's Encrypt SSL
- Domain name (optional, but recommended for SSL)
- Basic Linux/bash knowledge

---

## Oracle Cloud Setup

### Step 1: Create Oracle Cloud Account

1. Go to [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Click **Start for free**
3. Fill out the registration form
4. Verify your email and phone number
5. Add a credit card (for verification only - **you won't be charged**)

### Step 2: Create a Compute Instance

1. Log into [cloud.oracle.com](https://cloud.oracle.com/)
2. Navigate to **Compute** → **Instances**
3. Click **Create Instance**

**Configure the instance:**

```yaml
Name: vibekanban-server
Image: Ubuntu 22.04 (Minimal)
Shape: 
  - Click "Change Shape"
  - Select "Ampere" (ARM-based)
  - Choose VM.Standard.A1.Flex
  - OCPUs: 2
  - Memory: 12 GB (you can use up to 24 GB across all VMs)
Boot Volume: 100 GB (minimum, expand if needed)
```

**Networking:**

```yaml
VCN: Create new VCN (default)
Subnet: Public subnet
Assign public IPv4 address: Yes
```

**SSH Keys:**

- **Option 1**: Generate new key pair (download private key)
- **Option 2**: Upload your existing public key

Click **Create** and wait 2-3 minutes for provisioning.

### Step 3: Configure Security List (Firewall Rules)

1. Go to **Networking** → **Virtual Cloud Networks**
2. Click on your VCN
3. Click **Security Lists** → **Default Security List**
4. Click **Add Ingress Rules**

Add the following rules:

```yaml
# SSH
- Source CIDR: 0.0.0.0/0
  IP Protocol: TCP
  Destination Port: 22

# HTTP
- Source CIDR: 0.0.0.0/0
  IP Protocol: TCP
  Destination Port: 80

# HTTPS
- Source CIDR: 0.0.0.0/0
  IP Protocol: TCP
  Destination Port: 443

# Vibe Kanban (temporary, will be proxied later)
- Source CIDR: 0.0.0.0/0
  IP Protocol: TCP
  Destination Port: 8080
```

---

## VM Configuration

### Step 1: Connect to Your VM

```bash
# Save your private key (if downloaded)
chmod 600 ~/Downloads/ssh-key.key

# Connect (replace IP with your instance's public IP)
ssh -i ~/Downloads/ssh-key.key ubuntu@YOUR_PUBLIC_IP

# Or if using existing key
ssh ubuntu@YOUR_PUBLIC_IP
```

### Step 2: Update System

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y \
  curl \
  wget \
  git \
  vim \
  htop \
  ufw \
  build-essential
```

### Step 3: Configure Firewall

```bash
# Configure UFW (Ubuntu Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Vibe Kanban (temporary)

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status verbose
```

---

## Vibe Kanban Deployment

### Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add user to docker group (no need for sudo)
sudo usermod -aG docker $USER

# Apply group changes (or logout/login)
newgrp docker

# Verify installation
docker --version
docker run hello-world
```

### Step 2: Install Docker Compose

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### Step 3: Create Project Directory

```bash
# Create directory structure
mkdir -p ~/vibekanban
cd ~/vibekanban

# Create data directories
mkdir -p data/repos
mkdir -p data/db
mkdir -p logs
```

### Step 4: Create Docker Compose Configuration

Create `docker-compose.yml`:

```bash
cat > ~/vibekanban/docker-compose.yml <<'EOF'
version: '3.8'

services:
  vibekanban:
    image: ghcr.io/bloopaio/vibe-kanban:latest
    container_name: vibekanban
    restart: unless-stopped
    ports:
      - "8080:3000"
    volumes:
      - ./data/repos:/repos
      - ./data/db:/app/db
    environment:
      - HOST=0.0.0.0
      - PORT=3000
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  repos:
  db:
EOF
```

### Step 5: Deploy Vibe Kanban

```bash
# Start services
cd ~/vibekanban
docker-compose up -d

# Check logs
docker-compose logs -f vibekanban

# Verify it's running
curl http://localhost:8080

# Check from outside (replace with your public IP)
curl http://YOUR_PUBLIC_IP:8080
```

You should now be able to access Vibe Kanban at `http://YOUR_PUBLIC_IP:8080`

### Step 6: Create Systemd Service (Auto-start on Reboot)

```bash
sudo tee /etc/systemd/system/vibekanban.service > /dev/null <<'EOF'
[Unit]
Description=Vibe Kanban Docker Compose Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/vibekanban
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable vibekanban.service
sudo systemctl start vibekanban.service

# Check status
sudo systemctl status vibekanban.service
```

---

## GitHub Actions Runner Setup

### Step 1: Create Runner Directory

```bash
# Create runner directory
mkdir -p ~/actions-runner
cd ~/actions-runner
```

### Step 2: Download and Configure Runner

```bash
# Download latest runner (check GitHub for latest version)
RUNNER_VERSION="2.311.0"
curl -o actions-runner-linux-arm64-${RUNNER_VERSION}.tar.gz -L \
  https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-arm64-${RUNNER_VERSION}.tar.gz

# Extract
tar xzf actions-runner-linux-arm64-${RUNNER_VERSION}.tar.gz

# Get registration token from GitHub:
# Go to: https://github.com/YOUR_ORG/YOUR_REPO/settings/actions/runners/new
# Copy the token shown there

# Configure the runner
./config.sh \
  --url https://github.com/YOUR_ORG/YOUR_REPO \
  --token YOUR_REGISTRATION_TOKEN \
  --name oracle-vibekanban-runner \
  --work _work \
  --labels self-hosted,linux,arm64,vibekanban \
  --unattended

# Test runner (run once manually)
./run.sh
```

Press `Ctrl+C` after verifying it connects successfully.

### Step 3: Install Runner as Service

```bash
# Install service
sudo ./svc.sh install ubuntu

# Start service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status

# Enable auto-start
sudo systemctl enable actions.runner.YOUR-ORG-YOUR-REPO.oracle-vibekanban-runner.service
```

### Step 4: Verify Runner in GitHub

1. Go to `https://github.com/YOUR_ORG/YOUR_REPO/settings/actions/runners`
2. You should see `oracle-vibekanban-runner` with status **Idle** (green)

---

## Nginx Reverse Proxy with SSL

### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### Step 2: Configure DNS (If Using Domain)

If you have a domain (e.g., `vibekanban.yourcompany.com`):

1. Go to your DNS provider
2. Add an **A Record**:
   - Name: `vibekanban` (or `@` for root domain)
   - Value: `YOUR_PUBLIC_IP`
   - TTL: 300 (or default)

Wait 5-10 minutes for DNS propagation. Verify:

```bash
nslookup vibekanban.yourcompany.com
# Should return your public IP
```

### Step 3: Install Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain and email)
sudo certbot --nginx \
  -d vibekanban.yourcompany.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive \
  --redirect

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 4: Configure Nginx with Basic Auth

```bash
# Install apache2-utils for htpasswd
sudo apt install -y apache2-utils

# Create password file (replace 'admin' with desired username)
sudo htpasswd -c /etc/nginx/.htpasswd admin
# Enter password when prompted

# Add more users (without -c flag)
sudo htpasswd /etc/nginx/.htpasswd developer1
sudo htpasswd /etc/nginx/.htpasswd developer2
```

### Step 5: Create Nginx Configuration

```bash
sudo tee /etc/nginx/sites-available/vibekanban > /dev/null <<'EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=vibekanban_limit:10m rate=10r/s;

upstream vibekanban_backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name vibekanban.yourcompany.com;  # Replace with your domain
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vibekanban.yourcompany.com;  # Replace with your domain

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/vibekanban.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vibekanban.yourcompany.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Basic Authentication
    auth_basic "Vibe Kanban Access";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # Rate limiting
    limit_req zone=vibekanban_limit burst=20 nodelay;

    # Logging
    access_log /var/log/nginx/vibekanban_access.log;
    error_log /var/log/nginx/vibekanban_error.log;

    # Increase timeouts for long-running operations
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;

    location / {
        proxy_pass http://vibekanban_backend;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable buffering for SSE/streaming
        proxy_buffering off;
        proxy_cache off;
    }

    # Health check endpoint (no auth required)
    location /health {
        auth_basic off;
        proxy_pass http://vibekanban_backend;
        access_log off;
    }
}
EOF

# Replace domain in config (if different)
sudo sed -i 's/vibekanban.yourcompany.com/YOUR_ACTUAL_DOMAIN/g' /etc/nginx/sites-available/vibekanban
```

### Step 6: Enable Configuration and Restart Nginx

```bash
# Test configuration
sudo nginx -t

# Enable site
sudo ln -sf /etc/nginx/sites-available/vibekanban /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl restart nginx

# Enable auto-start
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 7: Close Direct Access to Port 8080

```bash
# Remove direct access (now proxied through Nginx)
sudo ufw delete allow 8080/tcp

# Verify firewall status
sudo ufw status
```

Now access Vibe Kanban at: `https://vibekanban.yourcompany.com`

---

## GitHub Integration

### Step 1: Create MCP Client Script

Create a Node.js script to communicate with Vibe Kanban's MCP server:

```bash
mkdir -p ~/github-sync
cd ~/github-sync

# Initialize npm project
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk
```

Create `mcp-client.js`:

```javascript
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const { spawn } = require("child_process");

class VibeMCPClient {
  constructor() {
    this.client = null;
    this.transport = null;
  }

  async connect() {
    // Spawn the MCP server process
    const serverProcess = spawn("npx", ["-y", "vibe-kanban@latest", "--mcp"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Create transport
    this.transport = new StdioClientTransport({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin,
    });

    // Create client
    this.client = new Client(
      {
        name: "github-sync-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await this.client.connect(this.transport);
    console.log("✅ Connected to Vibe Kanban MCP server");
  }

  async listProjects() {
    const result = await this.client.callTool({
      name: "list_projects",
      arguments: {},
    });
    return JSON.parse(result.content[0].text);
  }

  async listTasks(projectId, status = null) {
    const args = { project_id: projectId };
    if (status) args.status = status;

    const result = await this.client.callTool({
      name: "list_tasks",
      arguments: args,
    });
    return JSON.parse(result.content[0].text);
  }

  async createTask(projectId, title, description) {
    const result = await this.client.callTool({
      name: "create_task",
      arguments: {
        project_id: projectId,
        title,
        description,
      },
    });
    return JSON.parse(result.content[0].text);
  }

  async updateTask(taskId, updates) {
    const args = { task_id: taskId, ...updates };
    const result = await this.client.callTool({
      name: "update_task",
      arguments: args,
    });
    return JSON.parse(result.content[0].text);
  }

  async getTask(taskId) {
    const result = await this.client.callTool({
      name: "get_task",
      arguments: { task_id: taskId },
    });
    return JSON.parse(result.content[0].text);
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}

module.exports = { VibeMCPClient };
```

Create `sync-issue-to-vibe.js`:

```javascript
#!/usr/bin/env node

const { VibeMCPClient } = require("./mcp-client");

async function syncIssueToVibeKanban() {
  const {
    ISSUE_NUMBER,
    ISSUE_TITLE,
    ISSUE_BODY,
    ISSUE_STATE,
    ISSUE_URL,
    ISSUE_LABELS,
    ACTION,
    PROJECT_ID,
  } = process.env;

  console.log(`🔄 Syncing GitHub Issue #${ISSUE_NUMBER} (${ACTION})`);

  const client = new VibeMCPClient();

  try {
    await client.connect();

    // Get existing tasks to check for duplicates
    const tasks = await client.listTasks(PROJECT_ID);
    const existingTask = tasks.find(
      (task) =>
        task.title.includes(`[GH #${ISSUE_NUMBER}]`) ||
        (task.description && task.description.includes(ISSUE_URL))
    );

    // Parse labels
    const labels = ISSUE_LABELS ? JSON.parse(ISSUE_LABELS) : [];
    const labelText = labels.map((l) => l.name).join(", ");

    // Build task description
    const description = `${ISSUE_BODY || "No description provided."}

---
**GitHub Issue**: ${ISSUE_URL}
**Issue Number**: #${ISSUE_NUMBER}
**Labels**: ${labelText || "None"}
**Synced**: ${new Date().toISOString()}`;

    if (ACTION === "opened" || ACTION === "reopened") {
      if (!existingTask) {
        // Create new task
        console.log("📝 Creating new task for issue...");
        const result = await client.createTask(
          PROJECT_ID,
          `[GH #${ISSUE_NUMBER}] ${ISSUE_TITLE}`,
          description
        );
        console.log(`✅ Task created: ${result.id}`);
      } else {
        console.log("ℹ️  Task already exists, updating...");
        await client.updateTask(existingTask.id, {
          title: `[GH #${ISSUE_NUMBER}] ${ISSUE_TITLE}`,
          description,
          status: "todo",
        });
        console.log(`✅ Task updated: ${existingTask.id}`);
      }
    } else if (ACTION === "edited" && existingTask) {
      // Update existing task
      console.log("✏️  Updating task details...");
      await client.updateTask(existingTask.id, {
        title: `[GH #${ISSUE_NUMBER}] ${ISSUE_TITLE}`,
        description,
      });
      console.log(`✅ Task updated: ${existingTask.id}`);
    } else if (ACTION === "closed" && existingTask) {
      // Mark task as completed
      console.log("✔️  Marking task as completed...");
      await client.updateTask(existingTask.id, {
        status: "completed",
      });
      console.log(`✅ Task completed: ${existingTask.id}`);
    } else {
      console.log(`ℹ️  No action needed for: ${ACTION}`);
    }
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  syncIssueToVibeKanban().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { syncIssueToVibeKanban };
```

Make it executable:

```bash
chmod +x ~/github-sync/sync-issue-to-vibe.js
```

### Step 2: Create GitHub Actions Workflow

In your repository, create `.github/workflows/sync-issues-to-vibekanban.yml`:

```yaml
name: Sync GitHub Issues to Vibe Kanban

on:
  issues:
    types: [opened, edited, reopened, closed, labeled, unlabeled]

jobs:
  sync-to-vibekanban:
    runs-on: self-hosted
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: ~/github-sync/package-lock.json
      
      - name: Install dependencies
        run: |
          cd ~/github-sync
          npm ci
      
      - name: Sync Issue to Vibe Kanban
        env:
          ISSUE_NUMBER: ${{ github.event.issue.number }}
          ISSUE_TITLE: ${{ github.event.issue.title }}
          ISSUE_BODY: ${{ github.event.issue.body }}
          ISSUE_STATE: ${{ github.event.issue.state }}
          ISSUE_URL: ${{ github.event.issue.html_url }}
          ISSUE_LABELS: ${{ toJson(github.event.issue.labels) }}
          ACTION: ${{ github.event.action }}
          PROJECT_ID: ${{ secrets.VIBEKANBAN_PROJECT_ID }}
        run: |
          cd ~/github-sync
          node sync-issue-to-vibe.js
      
      - name: Comment on Issue (Success)
        if: success()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Task synced to Vibe Kanban successfully!'
            })
      
      - name: Comment on Issue (Failure)
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Failed to sync task to Vibe Kanban. Check workflow logs for details.'
            })
```

### Step 3: Add Project ID Secret

1. Get your Vibe Kanban project ID:
   - Access Vibe Kanban UI
   - Open your project
   - Project ID is in the URL: `http://your-ip:8080/projects/PROJECT_ID`

2. Add secret to GitHub:
   - Go to: `https://github.com/YOUR_ORG/YOUR_REPO/settings/secrets/actions`
   - Click **New repository secret**
   - Name: `VIBEKANBAN_PROJECT_ID`
   - Value: Your project ID
   - Click **Add secret**

### Step 4: Test the Workflow

Create a test issue in your repository:

```bash
# From your local machine
gh issue create \
  --title "Test Vibe Kanban Sync" \
  --body "This is a test issue to verify sync with Vibe Kanban"
```

Check:
1. GitHub Actions workflow runs successfully
2. Task appears in Vibe Kanban with `[GH #X]` prefix
3. Comment appears on the issue

---

## Bidirectional Sync Implementation

### Step 1: Create Reverse Sync Script

Create `~/github-sync/sync-vibe-to-github.js`:

```javascript
#!/usr/bin/env node

const { VibeMCPClient } = require("./mcp-client");
const { Octokit } = require("@octokit/rest");

async function syncVibeToGitHub() {
  const { GITHUB_TOKEN, GITHUB_REPO, PROJECT_ID } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_REPO || !PROJECT_ID) {
    console.error("❌ Missing required environment variables");
    process.exit(1);
  }

  const [owner, repo] = GITHUB_REPO.split("/");
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  const client = new VibeMCPClient();

  try {
    await client.connect();
    console.log("🔄 Checking for completed tasks to sync back to GitHub...");

    // Get all tasks
    const tasks = await client.listTasks(PROJECT_ID);

    // Filter tasks that are linked to GitHub issues and completed
    const completedTasks = tasks.filter(
      (task) =>
        task.status === "completed" &&
        task.title.match(/\[GH #(\d+)\]/) &&
        task.description &&
        task.description.includes("github.com")
    );

    console.log(`📊 Found ${completedTasks.length} completed tasks linked to GitHub issues`);

    for (const task of completedTasks) {
      const issueMatch = task.title.match(/\[GH #(\d+)\]/);
      if (!issueMatch) continue;

      const issueNumber = parseInt(issueMatch[1]);

      try {
        // Get current issue state
        const { data: issue } = await octokit.rest.issues.get({
          owner,
          repo,
          issue_number: issueNumber,
        });

        // Only close if still open
        if (issue.state === "open") {
          console.log(`🔒 Closing GitHub issue #${issueNumber}...`);

          await octokit.rest.issues.update({
            owner,
            repo,
            issue_number: issueNumber,
            state: "closed",
            state_reason: "completed",
          });

          // Add comment
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: "✅ Task completed in Vibe Kanban. Automatically closing issue.",
          });

          console.log(`✅ Closed issue #${issueNumber}`);
        } else {
          console.log(`ℹ️  Issue #${issueNumber} already closed`);
        }
      } catch (error) {
        console.error(`❌ Failed to close issue #${issueNumber}:`, error.message);
      }
    }

    console.log("✅ Reverse sync completed");
  } catch (error) {
    console.error("❌ Reverse sync failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  syncVibeToGitHub().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { syncVibeToGitHub };
```

Install additional dependency:

```bash
cd ~/github-sync
npm install @octokit/rest
```

### Step 2: Create Scheduled Sync Workflow

Create `.github/workflows/reverse-sync-vibekanban.yml`:

```yaml
name: Sync Vibe Kanban to GitHub (Reverse Sync)

on:
  schedule:
    # Run every 30 minutes
    - cron: '*/30 * * * *'
  
  workflow_dispatch:  # Allow manual trigger

jobs:
  reverse-sync:
    runs-on: self-hosted
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd ~/github-sync
          npm ci
      
      - name: Sync Completed Tasks to GitHub
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
          PROJECT_ID: ${{ secrets.VIBEKANBAN_PROJECT_ID }}
        run: |
          cd ~/github-sync
          node sync-vibe-to-github.js
```

### Step 3: Create Manual Sync Command

Create `~/github-sync/manual-sync.sh`:

```bash
#!/bin/bash

# Manual bidirectional sync script
echo "🔄 Starting manual sync..."

# Export environment variables
export PROJECT_ID="YOUR_PROJECT_ID"  # Replace
export GITHUB_TOKEN="YOUR_GITHUB_TOKEN"  # Replace
export GITHUB_REPO="YOUR_ORG/YOUR_REPO"  # Replace

# Run reverse sync
cd ~/github-sync
node sync-vibe-to-github.js

echo "✅ Manual sync completed"
```

Make it executable:

```bash
chmod +x ~/github-sync/manual-sync.sh
```

---

## Security Hardening

### Step 1: Secure SSH Access

```bash
# Edit SSH config
sudo vim /etc/ssh/sshd_config

# Add/modify these lines:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# Port 2222  # Optional: change SSH port

# Restart SSH
sudo systemctl restart sshd

# If you changed the port, update firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

### Step 2: Install Fail2Ban

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Create local config
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/vibekanban_error.log
maxretry = 3
EOF

# Start and enable fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
```

### Step 3: Set Up Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Enable automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF
```

### Step 4: Secure Environment Variables

```bash
# Create secure .env file for GitHub token
cat > ~/.env.vibesync <<EOF
GITHUB_TOKEN=your_github_token_here
PROJECT_ID=your_project_id_here
GITHUB_REPO=your_org/your_repo
EOF

# Secure permissions
chmod 600 ~/.env.vibesync

# Update manual sync script to use it
cat > ~/github-sync/manual-sync.sh <<'EOF'
#!/bin/bash
set -a
source ~/.env.vibesync
set +a
cd ~/github-sync
node sync-vibe-to-github.js
EOF
```

---

## Monitoring & Maintenance

### Step 1: Set Up Monitoring Script

Create `~/vibekanban/monitor.sh`:

```bash
#!/bin/bash

echo "=== Vibe Kanban System Status ==="
echo ""

# Docker status
echo "📦 Docker Services:"
docker-compose -f ~/vibekanban/docker-compose.yml ps
echo ""

# Disk usage
echo "💾 Disk Usage:"
df -h | grep -E '^/dev/|Filesystem'
echo ""

# Memory usage
echo "🧠 Memory Usage:"
free -h
echo ""

# CPU load
echo "⚙️  CPU Load:"
uptime
echo ""

# Nginx status
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l | head -n 5
echo ""

# GitHub Actions Runner status
echo "🏃 GitHub Actions Runner:"
sudo systemctl status actions.runner.*.service --no-pager -l | head -n 5
echo ""

# Recent logs
echo "📋 Recent Vibe Kanban Logs (last 10 lines):"
docker-compose -f ~/vibekanban/docker-compose.yml logs --tail=10 vibekanban
echo ""

# SSL certificate expiry
echo "🔐 SSL Certificate Status:"
sudo certbot certificates 2>/dev/null | grep -A 3 "Certificate Name"
echo ""

echo "=== End of Status Report ==="
```

Make it executable:

```bash
chmod +x ~/vibekanban/monitor.sh

# Run it
~/vibekanban/monitor.sh
```

### Step 2: Set Up Log Rotation

```bash
# Create logrotate config
sudo tee /etc/logrotate.d/vibekanban > /dev/null <<EOF
/home/ubuntu/vibekanban/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 ubuntu ubuntu
}
EOF

# Test logrotate
sudo logrotate -d /etc/logrotate.d/vibekanban
```

### Step 3: Create Backup Script

Create `~/vibekanban/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="vibekanban_backup_${DATE}.tar.gz"

echo "🔄 Creating backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Stop services for consistent backup
cd ~/vibekanban
docker-compose stop

# Create backup
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
  -C /home/ubuntu vibekanban/data \
  --exclude='*.log'

# Restart services
docker-compose start

# Keep only last 7 backups
cd "$BACKUP_DIR"
ls -t vibekanban_backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup completed: $BACKUP_FILE"
echo "📁 Backup location: $BACKUP_DIR/$BACKUP_FILE"
```

Make it executable and schedule:

```bash
chmod +x ~/vibekanban/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/vibekanban/backup.sh") | crontab -
```

### Step 4: Set Up Health Check

Create `~/vibekanban/healthcheck.sh`:

```bash
#!/bin/bash

WEBHOOK_URL="YOUR_SLACK_OR_DISCORD_WEBHOOK"  # Optional

# Check if Vibe Kanban is responding
if ! curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "❌ Vibe Kanban is DOWN!"
    
    # Restart service
    docker-compose -f ~/vibekanban/docker-compose.yml restart
    
    # Send alert (optional)
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d '{"text":"🚨 Vibe Kanban was down and has been restarted"}'
    fi
else
    echo "✅ Vibe Kanban is healthy"
fi
```

Make it executable and schedule:

```bash
chmod +x ~/vibekanban/healthcheck.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/ubuntu/vibekanban/healthcheck.sh") | crontab -
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Docker Container Won't Start

```bash
# Check logs
docker-compose -f ~/vibekanban/docker-compose.yml logs vibekanban

# Check if port is already in use
sudo lsof -i :8080

# Restart Docker
sudo systemctl restart docker
docker-compose -f ~/vibekanban/docker-compose.yml up -d
```

#### 2. GitHub Actions Runner Offline

```bash
# Check runner status
sudo systemctl status actions.runner.*.service

# View logs
sudo journalctl -u actions.runner.*.service -n 50

# Restart runner
sudo systemctl restart actions.runner.*.service

# If registration token expired, re-configure:
cd ~/actions-runner
./config.sh remove  # Remove old registration
./config.sh --url https://github.com/YOUR_ORG/YOUR_REPO --token NEW_TOKEN
sudo ./svc.sh install ubuntu
sudo ./svc.sh start
```

#### 3. SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Force renewal (if needed)
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. Nginx 502 Bad Gateway

```bash
# Check if Vibe Kanban is running
docker ps | grep vibekanban

# Check Vibe Kanban logs
docker-compose -f ~/vibekanban/docker-compose.yml logs vibekanban

# Check Nginx error logs
sudo tail -f /var/log/nginx/vibekanban_error.log

# Test upstream connection
curl http://localhost:8080
```

#### 5. Sync Not Working

```bash
# Test MCP connection manually
cd ~/github-sync
node -e "
const { VibeMCPClient } = require('./mcp-client');
(async () => {
  const client = new VibeMCPClient();
  await client.connect();
  const projects = await client.listProjects();
  console.log('Projects:', projects);
  await client.close();
})();
"

# Check GitHub Actions logs
# Go to: https://github.com/YOUR_ORG/YOUR_REPO/actions

# Manually trigger sync
cd ~/github-sync
./manual-sync.sh
```

#### 6. Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker images and containers
docker system prune -a --volumes

# Clean old logs
sudo journalctl --vacuum-time=7d

# Check large files
du -sh /home/ubuntu/vibekanban/data/*
```

#### 7. Port Already in Use

```bash
# Find what's using port 8080
sudo lsof -i :8080

# Kill the process
sudo kill -9 $(sudo lsof -t -i:8080)

# Or change Vibe Kanban port in docker-compose.yml
```

### Useful Commands Reference

```bash
# View all services status
~/vibekanban/monitor.sh

# Restart Vibe Kanban
cd ~/vibekanban && docker-compose restart

# View live logs
docker-compose -f ~/vibekanban/docker-compose.yml logs -f

# Check firewall status
sudo ufw status verbose

# View Nginx access logs
sudo tail -f /var/log/nginx/vibekanban_access.log

# View fail2ban status
sudo fail2ban-client status

# Test Nginx configuration
sudo nginx -t

# Reload Nginx without restart
sudo nginx -s reload

# Check SSL certificate expiry
echo | openssl s_client -servername YOUR_DOMAIN -connect YOUR_DOMAIN:443 2>/dev/null | openssl x509 -noout -dates

# Manual backup
~/vibekanban/backup.sh

# Check cron jobs
crontab -l

# View system resource usage
htop
```

---

## Quick Reference

### Important URLs

- Vibe Kanban: `https://vibekanban.yourcompany.com`
- GitHub Actions: `https://github.com/YOUR_ORG/YOUR_REPO/actions`
- GitHub Runners: `https://github.com/YOUR_ORG/YOUR_REPO/settings/actions/runners`

### Important Files

- Docker Compose: `~/vibekanban/docker-compose.yml`
- Nginx Config: `/etc/nginx/sites-available/vibekanban`
- SSL Certificates: `/etc/letsencrypt/live/vibekanban.yourcompany.com/`
- Sync Scripts: `~/github-sync/`
- Backup Location: `~/backups/`
- Logs: `~/vibekanban/logs/`

### Credentials

- Basic Auth Users: `/etc/nginx/.htpasswd`
- GitHub Token: `~/.env.vibesync`
- Project ID: GitHub Secret `VIBEKANBAN_PROJECT_ID`

---

## Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| Check system status | Daily | `~/vibekanban/monitor.sh` |
| Review logs | Weekly | `docker-compose logs --tail=100` |
| Update packages | Weekly | `sudo apt update && sudo apt upgrade` |
| Check backups | Weekly | `ls -lh ~/backups/` |
| SSL renewal check | Monthly | `sudo certbot certificates` |
| Update Docker images | Monthly | `docker-compose pull && docker-compose up -d` |
| Full system audit | Monthly | Review all configurations |

---

## Support and Resources

- **Vibe Kanban Docs**: https://vibekanban.com/docs
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Oracle Cloud Docs**: https://docs.oracle.com/en-us/iaas/
- **Docker Docs**: https://docs.docker.com/
- **Nginx Docs**: https://nginx.org/en/docs/

---

**Setup Complete! 🎉**

Your Vibe Kanban instance is now:
- ✅ Running on Oracle Cloud Free Tier
- ✅ Accessible via HTTPS with SSL
- ✅ Protected with basic authentication
- ✅ Integrated with GitHub Actions
- ✅ Syncing issues bidirectionally
- ✅ Backed up daily
- ✅ Monitored and maintained
