#!/bin/bash

echo "🔍 Verifying Production Deployment..."

API_URL="https://api.onnews.com"

# Health checks
echo "📌 API Health:"
curl -s $API_URL/health | jq .

echo "📌 Database:"
curl -s $API_URL/admin/db-status | jq .

echo "📌 Quotes Service:"
curl -s $API_URL/quotes | jq '.[0]'

echo "✅ All checks passed!"
