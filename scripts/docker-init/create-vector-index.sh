#!/bin/bash
set -e

echo "========================================"
echo "Creating Vector Search Index"
echo "========================================"

# Wait for mongot to be ready
echo "Waiting for mongot (search binary) to be ready..."
sleep 5

# Check if index already exists
INDEX_EXISTS=$(mongosh --host mongodb:27017 --quiet --eval '
    db.getSiblingDB("actionatlas")
      .activities
      .getSearchIndexes("activity_vector_search")
      .length
' || echo 0)

if [ "$INDEX_EXISTS" != "0" ]; then
    echo "Vector search index already exists. Skipping creation."
    exit 0
fi

# Create vector search index
echo "Creating vector search index 'activity_vector_search'..."

mongosh --host mongodb:27017 --eval '
use actionatlas;

db.activities.createSearchIndex(
  "activity_vector_search",
  "vectorSearch",
  {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: 1536,
        similarity: "cosine"
      },
      {
        type: "filter",
        path: "isActive"
      },
      {
        type: "filter",
        path: "category"
      }
    ]
  }
);

print("✅ Vector search index created!");
'

echo ""
echo "Vector search index 'activity_vector_search' created successfully!"
echo ""
echo "You can now use \$vectorSearch in aggregation pipelines:"
echo ""
echo "  db.activities.aggregate(["
echo "    {"
echo "      \$vectorSearch: {"
echo "        index: \"activity_vector_search\","
echo "        path: \"embedding\","
echo "        queryVector: [...1536 dimensions...],"
echo "        numCandidates: 100,"
echo "        limit: 20"
echo "      }"
echo "    }"
echo "  ])"
echo ""
