variable "name_prefix" { type = string }
variable "cpu" { type = number }
variable "memory" { type = number }
variable "container_port" { type = number }
variable "container_name" { type = string; default = "fitcore-backend" }
variable "image_url" { type = string }
variable "database_url" { type = string }
variable "redis_host" { type = string }
variable "redis_port" { type = number }
variable "jwt_secret" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "ecs_security_group_id" { type = string }
variable "alb_target_group_arn" { type = string }
variable "aws_region" { type = string }
variable "ecr_repository_name" { type = string }

locals { tags = { Environment = "staging", Project = "fitcore-pro", ManagedBy = "terraform" } }

output "cluster_name" { value = aws_ecs_cluster.this.name }
output "ecr_repository_url" { value = aws_ecr_repository.this.repository_url }
