resource "aws_db_subnet_group" "this" {
  name        = "${var.name_prefix}-db-subnet-group"
  subnet_ids  = var.private_subnet_ids
  tags        = local.tags
}

resource "aws_security_group" "rds" {
  name        = "${var.name_prefix}-rds-sg"
  description = "RDS security group"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
  }

  tags = { Name = "${var.name_prefix}-rds-sg" }
}

resource "aws_db_instance" "this" {
  identifier             = "${var.name_prefix}-db"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  storage_type           = "gp3"
  db_name                = "fitcore_staging"
  username               = "fitcore"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  skip_final_snapshot    = false
  final_snapshot_identifier = "${var.name_prefix}-db-final"
  storage_encrypted      = true
  multi_az               = false
  tags                   = local.tags
}
