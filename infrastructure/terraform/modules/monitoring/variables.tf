variable "name_prefix" { type = string }
variable "aws_region" { type = string }
variable "ecs_service_name" { type = string }
variable "sns_topic_arn" { type = string }

locals { tags = { Environment = "staging", Project = "fitcore-pro", ManagedBy = "terraform" } }

output "dashboard_name" { value = aws_cloudwatch_dashboard.main.dashboard_name }
