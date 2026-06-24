variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "ecs_security_group_id" { type = string }
variable "node_type" { type = string }

locals { tags = { Environment = "staging", Project = "fitcore-pro", ManagedBy = "terraform" } }

output "endpoint" { value = aws_elasticache_replication_group.this.primary_endpoint_address }
output "port" { value = 6379 }
