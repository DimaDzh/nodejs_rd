#!/bin/bash

echo "🚀 Starting Mini Zipper API Tests with Newman"
echo "=============================================="

# Check if server is running
echo "📡 Checking if server is running on port 3000..."
if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "❌ Server is not running on localhost:3000"
    echo "Please start your NestJS server first:"
    echo "  cd mini-zipper && npm run start"
    exit 1
fi

echo "✅ Server is running!"
echo ""

# List available ZIP files
echo "📁 Available ZIP files in test-files folder:"
ls -la test-files/*.zip 2>/dev/null || echo "No ZIP files found in test-files directory"
echo ""

# Test 1: Single request for each ZIP file
echo "🧪 Test 1: Single request for each ZIP file"
echo "--------------------------------------------"
newman run newman-collection.json --reporters cli,json --reporter-json-export test-results-single.json

echo ""
echo "🧪 Test 2: Load test - 3 iterations of each request"
echo "---------------------------------------------------"
newman run newman-collection.json -n 3 --reporters cli,json --reporter-json-export test-results-load.json

echo ""
echo "🧪 Test 3: Concurrent test - 5 iterations with minimal delay"
echo "------------------------------------------------------------"
newman run newman-collection.json -n 5 --delay-request 100 --reporters cli,json --reporter-json-export test-results-concurrent.json

echo ""
echo "📊 Test Results Summary:"
echo "========================"
echo "Results saved to:"
echo "  - test-results-single.json"
echo "  - test-results-load.json"
echo "  - test-results-concurrent.json"
echo ""
echo "✅ All tests completed!"
