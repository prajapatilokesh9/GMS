variable "name_prefix" { type = string }
variable "vpc_cidr" { type = string }
variable "azs" { type = list(string) }
variable "container_port" { type = number }
variable "certificate_arn" { type = string }
variable "db_password" { type = string }
variable "jwt_secret" { type = string }

locals { tags = { Environment = "staging", Project = "fitcore-pro", ManagedBy = "terraform" } }

output "vpc_id" { value = aws_vpc.this.id }
output "public_subnet_ids" { value = aws_subnet.public[*].id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
output "ecs_security_group_id" { value = aws_security_group.ecs_tasks.id }
output "alb_dns_name" { value = aws_lb.this.dns_name }
output "alb_target_group_arn" { value = aws_lb_target_group.this.arn }
output "db_password_secret_arn" { value = aws_secretsmanager_secret.db_password.arn }
output "jwt_secret_arn" { value = aws_secretsmanager_secret.jwt_secret.arn }
