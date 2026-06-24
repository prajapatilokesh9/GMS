resource "aws_elasticache_subnet_group" "this" {
  name        = "${var.name_prefix}-redis-subnet-group"
  subnet_ids  = var.private_subnet_ids
  tags        = local.tags
}

resource "aws_security_group" "redis" {
  name        = "${var.name_prefix}-redis-sg"
  description = "ElastiCache Redis security group"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }

  tags = { Name = "${var.name_prefix}-redis-sg" }
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id          = "${var.name_prefix}-redis"
  description                   = "Staging Redis cluster"
  node_type                     = var.node_type
  num_cache_clusters            = 1
  port                          = 6379
  parameter_group_name          = "default.redis7"
  subnet_group_name             = aws_elasticache_subnet_group.this.name
  security_group_ids            = [aws_security_group.redis.id]
  automatic_failover_enabled    = false
  multi_az_enabled              = false
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
  tags                          = local.tags
}
