variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "ecs_security_group_id" { type = string }
variable "instance_class" { type = string }
variable "allocated_storage" { type = number }
variable "db_password" { type = string }

locals { tags = { Environment = "staging", Project = "fitcore-pro", ManagedBy = "terraform" } }

output "endpoint" { value = aws_db_instance.this.address }
output "port" { value = aws_db_instance.this.port }
output "database_name" { value = aws_db_instance.this.db_name }
