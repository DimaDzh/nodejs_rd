#!/usr/bin/env bash

# Test authentication endpoints
BASE_URL="http://localhost:3000"

echo "🧪 Testing Authentication Endpoints"
echo "=================================="

# Test 1: JSON Login
echo "📝 Test 1: Login with JSON body"
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  ${BASE_URL}/auth/login | jq .

echo -e "\n"

# Test 2: Basic Auth Login (Base64 encoding of test@example.com:password123)
echo "🔐 Test 2: Login with Basic Auth header"
echo "Base64 encoding: test@example.com:password123 -> dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw=="
curl -X POST \
  -H "Authorization: Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==" \
  ${BASE_URL}/auth/login | jq .

echo -e "\n"

# Test 3: Invalid credentials
echo "❌ Test 3: Login with invalid credentials"
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}' \
  ${BASE_URL}/auth/login | jq .

echo -e "\n"

# Test 4: Missing both JSON and Basic Auth
echo "❌ Test 4: Login without credentials"
curl -X POST ${BASE_URL}/auth/login | jq .
