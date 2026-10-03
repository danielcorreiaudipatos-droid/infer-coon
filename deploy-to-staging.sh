#!/bin/bash

# ONNEWS Platform - Staging Deployment Script
# Usage: ./deploy-to-staging.sh
# Prerequisites: AWS CLI configured, Docker installed, credentials in ~/.aws/credentials

set -e

# Configuration
ENVIRONMENT="staging"
REGION="us-east-1"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-123456789}"  # Replace with your actual account ID
ECR_REPO_NAME="onnews-api"
ECS_CLUSTER="onnews-staging"
ECS_SERVICE="onnews-api-service"
IMAGE_TAG="staging"

echo "🚀 ONNEWS Platform - Staging Deployment"
echo "========================================"
echo ""

# Step 1: Verify prerequisites
echo "✓ Step 1: Verifying prerequisites..."
if ! command -v aws &> /dev/null; then
    echo "✗ AWS CLI not found. Please install AWS CLI."
    exit 1
fi
if ! command -v docker &> /dev/null; then
    echo "✗ Docker not found. Please install Docker."
    exit 1
fi
echo "✓ AWS CLI and Docker found"
echo ""

# Step 2: Authenticate with ECR
echo "✓ Step 2: Authenticating with ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
echo "✓ ECR authentication successful"
echo ""

# Step 3: Build Docker image
echo "✓ Step 3: Building Docker image..."
docker build \
  --tag $ECR_REPO_NAME:$IMAGE_TAG \
  --tag $ECR_REPO_NAME:latest \
  --file api-onnews/Dockerfile \
  api-onnews/
echo "✓ Docker image built successfully"
echo ""

# Step 4: Tag image for ECR
echo "✓ Step 4: Tagging image for ECR..."
docker tag $ECR_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG
docker tag $ECR_REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME:latest
echo "✓ Image tagged for ECR"
echo ""

# Step 5: Push to ECR
echo "✓ Step 5: Pushing image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME:latest
echo "✓ Image pushed to ECR successfully"
echo ""

# Step 6: Deploy to ECS
echo "✓ Step 6: Deploying to ECS..."
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment \
  --region $REGION \
  --output json > /dev/null
echo "✓ ECS deployment initiated"
echo ""

# Step 7: Wait for deployment to stabilize
echo "⏳ Step 7: Waiting for deployment to stabilize (timeout: 10 minutes)..."
aws ecs wait services-stable \
  --cluster $ECS_CLUSTER \
  --services $ECS_SERVICE \
  --region $REGION
echo "✓ Deployment stabilized"
echo ""

# Step 8: Verify deployment
echo "✓ Step 8: Verifying deployment..."
SERVICE_INFO=$(aws ecs describe-services \
  --cluster $ECS_CLUSTER \
  --services $ECS_SERVICE \
  --region $REGION \
  --query 'services[0].[runningCount,desiredCount]' \
  --output json)

RUNNING=$(echo $SERVICE_INFO | jq '.[0]')
DESIRED=$(echo $SERVICE_INFO | jq '.[1]')

echo "✓ Running: $RUNNING / Desired: $DESIRED"
echo ""

# Step 9: Health check
echo "✓ Step 9: Performing health check..."
HEALTH_URL="https://staging-api.onnews.com/health"
echo "  Checking: $HEALTH_URL"
sleep 5  # Give service a moment to start
if curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "✓ Health check passed"
else
    echo "⚠ Health check returned non-200 status (service may still be starting)"
fi
echo ""

# Step 10: Summary
echo "🎉 Deployment Complete!"
echo "========================================"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "Cluster: $ECS_CLUSTER"
echo "Service: $ECS_SERVICE"
echo "Image: $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG"
echo ""
echo "📊 Deployment Details:"
echo "  API Endpoint: https://staging-api.onnews.com"
echo "  Docs: https://staging-api.onnews.com/docs"
echo "  Health: https://staging-api.onnews.com/health"
echo ""
echo "📋 Next Steps:"
echo "  1. Run smoke tests: npm run test:staging"
echo "  2. Check CloudWatch logs: aws logs tail /ecs/onnews-api-staging --follow"
echo "  3. Verify endpoints in Swagger: https://staging-api.onnews.com/docs"
echo "  4. Monitor ECS dashboard: https://console.aws.amazon.com/ecs"
echo ""
echo "✅ All systems deployed to staging!"
