module "network" {
  source = "./modules/network"

  name_prefix      = local.name_prefix
  vpc_cidr         = var.vpc_cidr
  azs              = ["${var.aws_region}a", "${var.aws_region}b"]
  container_port   = var.container_port
  certificate_arn  = "arn:aws:acm:${var.aws_region}:<ACCOUNT_ID>:certificate/<CERT_ID>"
  db_password      = random_password.db.result
  jwt_secret       = random_password.jwt.result
}

resource "random_password" "db" {
  length  = 24
  special = false
}

resource "random_password" "jwt" {
  length  = 64
  special = false
}

module "rds" {
  source = "./modules/rds"

  name_prefix         = local.name_prefix
  vpc_id              = module.network.vpc_id
  private_subnet_ids  = module.network.private_subnet_ids
  ecs_security_group_id = module.network.ecs_security_group_id
  instance_class      = var.rds_instance_class
  allocated_storage   = var.rds_allocated_storage
  db_password         = random_password.db.result
}

module "redis" {
  source = "./modules/redis"

  name_prefix         = local.name_prefix
  vpc_id              = module.network.vpc_id
  private_subnet_ids  = module.network.private_subnet_ids
  ecs_security_group_id = module.network.ecs_security_group_id
  node_type           = var.redis_node_type
}

module "ecs" {
  source = "./modules/ecs"

  name_prefix          = local.name_prefix
  cpu                  = var.ecs_cpu
  memory               = var.ecs_memory
  container_port       = var.container_port
  image_url            = "<ACCOUNT_ID>.dkr.ecr.${var.aws_region}.amazonaws.com/${var.ecr_repository_name}:latest"
  database_url         = "postgresql://fitcore:${random_password.db.result}@${module.rds.endpoint}:${module.rds.port}/${module.rds.database_name}"
  redis_host           = module.redis.endpoint
  redis_port           = module.redis.port
  jwt_secret           = random_password.jwt.result
  private_subnet_ids   = module.network.private_subnet_ids
  ecs_security_group_id = module.network.ecs_security_group_id
  alb_target_group_arn = module.network.alb_target_group_arn
  aws_region           = var.aws_region
  ecr_repository_name  = var.ecr_repository_name
}
