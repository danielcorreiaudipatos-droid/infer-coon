#!/bin/bash

set -e

echo "🚀 Deploying to Staging..."

# Set environment
ENVIRONMENT=staging
REGION=us-east-1
CLUSTER=onnews-staging

# Build and push image
echo "📦 Building Docker image..."
docker build -t onnews-api:latest api-onnews/
docker tag onnews-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/onnews-api:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/onnews-api:latest

# Deploy to ECS
echo "🐳 Deploying to ECS..."
aws ecs update-service \
  --cluster $CLUSTER \
  --service onnews-api-service \
  --force-new-deployment \
  --region $REGION

# Wait for deployment
echo "⏳ Waiting for deployment..."
aws ecs wait services-stable \
  --cluster $CLUSTER \
  --services onnews-api-service \
  --region $REGION

echo "✅ Staging deployment complete!"
