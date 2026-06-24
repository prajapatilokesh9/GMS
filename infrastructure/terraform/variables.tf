variable "aws_region" {
  description = "AWS region for staging deployment"
  type        = string
  default     = "ap-south-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "container_port" {
  description = "Backend container port"
  type        = number
  default     = 4000
}

variable "ecs_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 512
}

variable "ecs_memory" {
  description = "ECS task memory MB"
  type        = number
  default     = 1024
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t4g.micro"
}

variable "domain_name" {
  description = "Staging domain name"
  type        = string
  default     = "api-staging.fitcore.app"
}

variable "ecr_repository_name" {
  description = "ECR repository name"
  type        = string
  default     = "fitcore-backend"
}
