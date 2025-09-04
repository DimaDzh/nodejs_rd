#!/bin/bash

BASE_URL="http://localhost:3000"
echo "Testing Admin Role Authorization"
echo "=================================="

echo ""
echo "1. Login as regular user"
echo "------------------------"
USER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
echo "Response: $USER_RESPONSE"

USER_TOKEN=$(echo "$USER_RESPONSE" | jq -r '.accessToken')
echo "User Token: ${USER_TOKEN:0:50}..."

echo ""
echo "2. Login as admin user"
echo "---------------------"
ADMIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')
echo "Response: $ADMIN_RESPONSE"

ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.accessToken')
echo "Admin Token: ${ADMIN_TOKEN:0:50}..."

echo ""
echo "3. Try accessing /admin/metrics with user token (should get 403)"
echo "---------------------------------------------------------------"
USER_METRICS_RESPONSE=$(curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $USER_TOKEN" \
  "${BASE_URL}/admin/metrics")
echo "Response: $USER_METRICS_RESPONSE"

echo ""
echo "4. Try accessing /admin/metrics with admin token (should get 200)"
echo "----------------------------------------------------------------"
ADMIN_METRICS_RESPONSE=$(curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "${BASE_URL}/admin/metrics")
echo "Response: $ADMIN_METRICS_RESPONSE"

echo ""
echo "5. Try accessing /admin/metrics without token (should get 401)"
echo "-------------------------------------------------------------"
NO_TOKEN_RESPONSE=$(curl -s -w "\nHTTP Status: %{http_code}\n" \
  "${BASE_URL}/admin/metrics")
echo "Response: $NO_TOKEN_RESPONSE"

echo ""
echo "6. Test Basic Auth login"
echo "-----------------------"
BASIC_AUTH=$(echo -n "admin@example.com:admin123" | base64)
BASIC_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Authorization: Basic $BASIC_AUTH")
echo "Response: $BASIC_RESPONSE"

echo ""
echo "Test completed!"
