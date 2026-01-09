# Docker Operations Guide

This guide covers all Docker-related operations for local development of Action Atlas.

## Table of Contents

- [Quick Start](#quick-start)
- [Container Management](#container-management)
- [Database Operations](#database-operations)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)
- [Advanced Operations](#advanced-operations)

## Quick Start

### Prerequisites

- **Docker Desktop** (v4.0+) installed and running
- **Docker Compose** (v2.0+)
- At least 4GB of free disk space for MongoDB data

### Starting the Environment

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs to verify initialization
docker-compose logs -f

# Look for "MongoDB initialization complete!" message
```

### Stopping the Environment

```bash
# Stop all services (preserves data)
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v
```

## Container Management

### Service Overview

The Docker setup includes three services:

1. **mongodb** - MongoDB 8.0 with vector search support
   - Port: 27017
   - Data persistence: Named volume `mongodb_data`
   - Replica set: rs0 (required for vector search)

2. **mongot** - MongoDB Search Binary
   - Handles vector search indexing
   - Internal communication only (no exposed ports)

3. **mongodb-init** - Initialization container
   - Runs once to set up replica set
   - Loads seed data
   - Creates vector search index
   - Exits after completion

### Starting Individual Services

```bash
# Start only MongoDB
docker-compose up -d mongodb

# Start MongoDB and mongot (without init)
docker-compose up -d mongodb mongot

# Start all services
docker-compose up -d
```

### Checking Service Status

```bash
# List all containers
docker-compose ps

# Check MongoDB health
docker exec action-atlas-mongodb mongosh --eval "db.adminCommand('ping')"

# Check replica set status
docker exec action-atlas-mongodb mongosh --eval "rs.status()"
```

### Restart Services

```bash
# Restart specific service
docker-compose restart mongodb

# Restart all services
docker-compose restart

# Force recreate containers (use if config changed)
docker-compose up -d --force-recreate
```

## Database Operations

### Accessing MongoDB Shell

```bash
# Connect to MongoDB shell
docker exec -it action-atlas-mongodb mongosh

# Connect directly to actionatlas database
docker exec -it action-atlas-mongodb mongosh actionatlas

# Run a single command
docker exec action-atlas-mongodb mongosh --eval "db.activities.countDocuments()"
```

### Common MongoDB Commands

```javascript
// Switch to actionatlas database
use actionatlas

// Count documents
db.activities.countDocuments()
db.organizations.countDocuments()

// View sample activity
db.activities.findOne()

// Check if embeddings exist
db.activities.findOne({ embedding: { $exists: true } })

// List all collections
show collections

// Check database stats
db.stats()

// List search indexes
db.activities.getSearchIndexes()
```

### Data Management

#### Reset Database

```bash
# Stop services and remove volumes
docker-compose down -v

# Restart (will reload data)
docker-compose up -d

# Monitor initialization
docker-compose logs -f mongodb-init
```

#### Backup Database

```bash
# Create backup
docker exec action-atlas-mongodb mongodump \
  --db=actionatlas \
  --gzip \
  --archive=/tmp/backup.agz

# Copy backup to host
docker cp action-atlas-mongodb:/tmp/backup.agz ./backup-$(date +%Y%m%d).agz
```

#### Restore Database

```bash
# Copy backup to container
docker cp ./backup.agz action-atlas-mongodb:/tmp/backup.agz

# Restore backup
docker exec action-atlas-mongodb mongorestore \
  --gzip \
  --archive=/tmp/backup.agz \
  --drop
```

### Seed Data Management

The seed data file is located at `/Users/magino.marveauxcochet/Dev/action-atlas/data/seed-dataset.agz` (26MB).

```bash
# Check if seed data exists
ls -lh data/seed-dataset.agz

# Reload seed data (requires full reset)
docker-compose down -v
docker-compose up -d
```

## Monitoring & Logs

### Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs mongodb
docker-compose logs mongot
docker-compose logs mongodb-init

# View last 100 lines
docker-compose logs --tail=100

# View logs since specific time
docker-compose logs --since=10m
```

### MongoDB Logs

```bash
# View MongoDB server logs
docker logs action-atlas-mongodb

# Follow MongoDB logs
docker logs -f action-atlas-mongodb

# Filter for errors
docker logs action-atlas-mongodb 2>&1 | grep -i error

# Check for vector search operations
docker logs action-atlas-mongodb 2>&1 | grep -i vectorSearch
```

### Resource Usage

```bash
# View container resource usage
docker stats

# View specific container stats
docker stats action-atlas-mongodb

# Check disk usage
docker system df

# Check volume size
docker volume ls
docker volume inspect action-atlas_mongodb_data
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Not Starting

**Symptoms**: Container exits immediately or health check fails

**Solutions**:

```bash
# Check logs for errors
docker logs action-atlas-mongodb

# Remove corrupted volumes
docker-compose down -v
docker-compose up -d

# Check port availability
lsof -i :27017
```

#### 2. Port 27017 Already in Use

**Symptoms**: `Error: bind: address already in use`

**Solutions**:

```bash
# Find process using port
lsof -i :27017

# Stop local MongoDB if running
brew services stop mongodb-community  # macOS
sudo systemctl stop mongod            # Linux

# OR change port in docker-compose.yml
ports:
  - "27018:27017"  # Use different host port
```

#### 3. Replica Set Not Initialized

**Symptoms**: `ReadConcernMajorityNotAvailableYet` errors

**Solutions**:

```bash
# Check replica set status
docker exec action-atlas-mongodb mongosh --eval "rs.status()"

# Re-initialize replica set
docker exec action-atlas-mongodb mongosh --eval "rs.initiate()"

# Wait for replica set to stabilize (30 seconds)
sleep 30
```

#### 4. Vector Search Index Missing

**Symptoms**: `index 'activity_vector_search' not found`

**Solutions**:

```bash
# Check if index exists
docker exec action-atlas-mongodb mongosh actionatlas \
  --eval "db.activities.getSearchIndexes()"

# Recreate index (manual)
docker exec action-atlas-mongodb mongosh actionatlas \
  --eval 'db.activities.createSearchIndex("activity_vector_search", "vectorSearch", {fields: [{type: "vector", path: "embedding", numDimensions: 1536, similarity: "cosine"}]})'
```

#### 5. Slow Performance

**Symptoms**: High CPU/memory usage, slow queries

**Solutions**:

```bash
# Check resource usage
docker stats action-atlas-mongodb

# Check MongoDB server status
docker exec action-atlas-mongodb mongosh --eval "db.serverStatus()"

# Check current operations
docker exec action-atlas-mongodb mongosh --eval "db.currentOp()"

# Increase Docker Desktop resources (Preferences > Resources)
```

### Docker Desktop Issues (macOS)

#### Volume Mount Errors

**Symptoms**: `read-only file system` or mount errors

**Solutions**:

1. Restart Docker Desktop
2. Reset Docker Desktop (Preferences > Troubleshoot > Reset)
3. Check File Sharing settings (Preferences > Resources > File Sharing)
4. Ensure project directory is in allowed paths

#### Disk Space Issues

```bash
# Clean up Docker system
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Advanced Operations

### Performance Tuning

#### MongoDB Configuration

The MongoDB container uses these optimized settings:

```yaml
command: ["--replSet", "rs0", "--bind_ip_all"]
healthcheck:
  test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
  interval: 5s
  timeout: 10s
  retries: 10
  start_period: 30s
```

#### Increase MongoDB Cache

Edit `docker-compose.yml`:

```yaml
mongodb:
  command: ["--replSet", "rs0", "--bind_ip_all", "--wiredTigerCacheSizeGB", "2"]
```

### Networking

#### Access from Host

```bash
# MongoDB is accessible at:
mongodb://localhost:27017/actionatlas

# Test connection
mongosh mongodb://localhost:27017/actionatlas
```

#### Access from Other Containers

```bash
# Use service name as hostname:
mongodb://mongodb:27017/actionatlas
```

### Custom Initialization Scripts

Place `.js` or `.sh` scripts in `scripts/docker-init/` to run during initialization:

```bash
# Scripts are executed in alphabetical order
scripts/docker-init/
├── 01-init-replica-set.sh
├── 02-load-data.sh
└── 03-create-indexes.sh
```

### Export/Import Data

#### Export to JSON

```bash
# Export activities collection
docker exec action-atlas-mongodb mongoexport \
  --db=actionatlas \
  --collection=activities \
  --out=/tmp/activities.json

# Copy to host
docker cp action-atlas-mongodb:/tmp/activities.json ./
```

#### Import from JSON

```bash
# Copy to container
docker cp ./activities.json action-atlas-mongodb:/tmp/

# Import
docker exec action-atlas-mongodb mongoimport \
  --db=actionatlas \
  --collection=activities \
  --file=/tmp/activities.json
```

### Multi-Environment Setup

#### Development

```bash
docker-compose up -d
```

#### Testing

```bash
# Use separate compose file
docker-compose -f docker-compose.test.yml up -d
```

#### CI/CD

```bash
# Non-interactive mode
docker-compose up -d --wait

# Run tests
npm test

# Cleanup
docker-compose down -v
```

## Performance Targets

- **Container startup**: <30 seconds
- **MongoDB ready**: <15 seconds
- **Initialization complete**: <2 minutes (first run), <10 seconds (subsequent)
- **Memory usage**: <512MB (MongoDB), <256MB (mongot)
- **Disk usage**: <500MB

## Security Notes

### Development Only

This Docker setup is **for local development only**. It includes:

- No authentication (open access)
- No TLS/SSL
- No network restrictions
- Debug logging enabled

### Production Deployment

For production, use:
- **MongoDB Atlas** (managed service)
- **OR** Self-hosted MongoDB Enterprise with:
  - Authentication enabled
  - TLS/SSL encryption
  - Network isolation
  - Backup automation
  - Monitoring integration

## Additional Resources

- [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)
- [MongoDB Vector Search Docs](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB 8.0 Release Notes](https://www.mongodb.com/docs/manual/release-notes/8.0/)

## Support

For issues specific to this project:
1. Check this troubleshooting guide
2. Review logs: `docker-compose logs`
3. Check GitHub Issues
4. Consult CLAUDE.md for development guidance

---

**Last Updated**: 2026-01-09
**Docker Compose Version**: 2.40+
**MongoDB Version**: 8.0
**Status**: Production-ready for local development
