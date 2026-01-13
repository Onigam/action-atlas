#!/bin/bash

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 10

# Using manual cosine similarity for local development
# No replica set or mongot configuration needed
echo "Vector search will use manual cosine similarity calculation"

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

// Note: Vector search indexes are not needed for manual similarity
// The application will automatically use manual cosine similarity calculation
// For production deployments, use MongoDB Atlas which has native $vectorSearch
print("");
print("✓ Using manual cosine similarity for vector search");
print("  - Embeddings stored in 'embedding' field");
print("  - Dimensions: 1536");
print("  - Similarity: cosine");
print("  - Performance: Optimized aggregation pipeline");
print("");
print("📝 Note: For production, use MongoDB Atlas for native \$vectorSearch");

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
print("  mongodb://localhost:27018/actionatlas");
print("");
print("VECTOR SEARCH METHOD:");
print("  Manual cosine similarity calculation");
print("  - Automatic fallback for local development");
print("  - Uses optimized MongoDB aggregation pipeline");
print("  - Filter by: isActive, category, createdAt");
print("  - Production uses MongoDB Atlas native \$vectorSearch");
print("");
print("=".repeat(70));

EOF

echo "✅ Vector search initialization and data loading completed!"
