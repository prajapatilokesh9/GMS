#!/bin/bash
# FitCore Pro — Deploy script for staging/production
set -euo pipefail

ENV="${1:-staging}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
ECR_REPO="${ECR_REPO:-fitcore-backend}"
ECS_CLUSTER="${ECS_CLUSTER:-fitcore-$ENV}"
ECS_SERVICE="${ECS_SERVICE:-fitcore-backend-$ENV}"

echo "Deploying FitCore Pro to $ENV..."

# Build and push Docker image
docker build -f infrastructure/docker/Dockerfile.backend -t $ECR_REPO:latest .
docker tag $ECR_REPO:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$CI_COMMIT_SHA"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$CI_COMMIT_SHA"

# Update ECS service
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment \
  --region $AWS_REGION

echo "Deployment triggered successfully."
