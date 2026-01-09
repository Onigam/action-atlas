#!/bin/bash

# Test script for API endpoints
# Make sure the development server is running before executing this script

BASE_URL="http://localhost:3000"

echo "Testing Action Atlas API Endpoints"
echo "===================================="
echo ""

# Test 1: Search API
echo "1. Testing POST /api/search"
echo "   Request: { \"query\": \"teach programming\" }"
curl -s -X POST "${BASE_URL}/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "teach programming"}' | jq '.' | head -20
echo ""

# Test 2: List Activities
echo "2. Testing GET /api/activities"
curl -s "${BASE_URL}/api/activities?page=1&pageSize=5" | jq '.' | head -30
echo ""

# Test 3: Get Single Activity (will fail if no activities exist)
echo "3. Testing GET /api/activities/:id"
echo "   Note: This will return 404 if no activities exist in the database"
curl -s "${BASE_URL}/api/activities/test-id" | jq '.'
echo ""

# Test 4: Create Activity
echo "4. Testing POST /api/activities"
echo "   Creating a test activity..."
curl -s -X POST "${BASE_URL}/api/activities" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teach Programming to Kids",
    "description": "Help children aged 8-12 learn the basics of programming through fun, interactive coding games and projects. We meet every Saturday afternoon to introduce concepts like loops, conditionals, and basic algorithms.",
    "organizationId": "test-org-123",
    "category": "education",
    "skills": [
      {"name": "JavaScript", "level": "beginner"},
      {"name": "Scratch", "level": "beginner"}
    ],
    "location": {
      "address": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "postalCode": "94102"
      },
      "coordinates": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749]
      }
    },
    "timeCommitment": {
      "hoursPerWeek": 3,
      "isFlexible": false,
      "isOneTime": false,
      "isRecurring": true,
      "schedule": "Saturdays 2-5pm"
    },
    "contact": {
      "name": "Jane Smith",
      "role": "Program Coordinator",
      "email": "jane@example.com",
      "phone": "555-1234"
    },
    "website": "https://example.com"
  }' | jq '.'
echo ""

# Test 5: Get Organization (will fail if no organizations exist)
echo "5. Testing GET /api/organizations/:id"
echo "   Note: This will return 404 if no organizations exist in the database"
curl -s "${BASE_URL}/api/organizations/test-org-123" | jq '.'
echo ""

echo "===================================="
echo "API Tests Complete!"
echo ""
echo "Note: Some tests may return 404 if the database is empty."
echo "Run 'pnpm seed' to populate the database with sample data."
