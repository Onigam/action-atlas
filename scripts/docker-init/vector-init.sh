#!/bin/bash

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 15

# Initialize replica set for vector search
echo "Initializing replica set..."
mongosh --host mongo_vector_main:27017 --quiet <<EOF

// Initialize replica set
var config = {
    "_id": "vector_search_replica_set",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "mongo_vector_main:27017",
            "priority": 2
        }
    ]
};

try {
    rs.initiate(config, { force: true });
    print("✓ Replica set initiated successfully");
} catch (e) {
    print("Replica set already initiated: " + e.message);
}

EOF

# Wait for replica set to be ready
echo "Waiting for replica set to become primary..."
sleep 10

# Load actual data from seed-dataset.agz
echo "========================================"
echo "Loading Action Atlas seed data..."
echo "========================================"

DATA_FILE="/seed-data/seed-dataset.agz"

if [ ! -f "$DATA_FILE" ]; then
    echo "❌ ERROR: Data file not found at $DATA_FILE"
    echo "Please ensure seed-dataset.agz exists in the data/ directory"
    exit 1
fi

echo "Data file: $DATA_FILE"
echo "File size: $(du -h $DATA_FILE | cut -f1)"

# Restore to MongoDB with database name mapping
echo "Restoring data to MongoDB..."
mongorestore \
    --host mongo_vector_main:27017 \
    --gzip \
    --archive="$DATA_FILE" \
    --drop \
    --nsFrom='thegoodsearch.*' \
    --nsTo='actionatlas.*'

# Verify data loaded and create indexes
echo "Setting up vector search indexes..."
mongosh --host mongo_vector_main:27017 --quiet <<EOF

// Switch to actionatlas database
use actionatlas;

// Verify data was loaded
var activityCount = db.activities.countDocuments();
var charityCount = db.charities.countDocuments();

print("");
print("✓ Data loaded successfully!");
print("  - Activities: " + activityCount);
print("  - Charities: " + charityCount);

// Create standard indexes for filtering
db.activities.createIndex({ "isActive": 1 });
db.activities.createIndex({ "category": 1 });
db.activities.createIndex({ "createdAt": 1 });
print("✓ Created metadata indexes for filtering");

// Note: Vector search indexes via createSearchIndex() are Atlas-only
// For local development, use aggregation pipelines with vector embeddings

print("");
print("=".repeat(70));
print("Action Atlas Vector Search Setup Completed!");
print("=".repeat(70));
print("");
print("CONNECTION INFO:");
print("  Host:       localhost");
print("  Port:       27018");
print("  Database:   actionatlas");
print("  Collection: activities");
print("");
print("CONNECTION STRING:");
print("  mongodb://localhost:27018/actionatlas?replicaSet=vector_search_replica_set");
print("");
print("VECTOR SEARCH:");
print("  Use aggregation pipelines for semantic search with embeddings");
print("  Filter by: isActive, category, createdAt");
print("");
print("=".repeat(70));

EOF

echo "✅ Vector search initialization and data loading completed!"
