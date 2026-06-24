resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.name_prefix}-dashboard"
  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["FitCorePro", "RequestCount", { stat = "Sum", period = 300 }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "Request Count (5min)"
          view   = "timeSeries"
          stacked = false
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["FitCorePro", "RequestDuration", { stat = "p50", period = 300 }],
            ["FitCorePro", "RequestDuration", { stat = "p95", period = 300 }],
            ["FitCorePro", "RequestDuration", { stat = "p99", period = 300 }]
          ]
          period = 300
          stat   = "p50"
          region = var.aws_region
          title  = "Request Duration (ms) — p50/p95/p99"
          view   = "timeSeries"
          stacked = false
          yAxis = { left = { label = "ms" } }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["FitCorePro", "ServerErrorCount", { stat = "Sum", period = 300 }],
            ["FitCorePro", "ClientErrorCount", { stat = "Sum", period = 300 }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "Error Count (5min) — 5xx / 4xx"
          view   = "timeSeries"
          stacked = false
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", { stat = "Average", period = 300 }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Database Connections"
          view   = "timeSeries"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CurrConnections", { stat = "Average", period = 300 }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Redis Connections"
          view   = "timeSeries"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", { stat = "Average", period = 300, dimensions = ["ServiceName", var.ecs_service_name] }],
            ["AWS/ECS", "MemoryUtilization", { stat = "Average", period = 300, dimensions = ["ServiceName", var.ecs_service_name] }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ECS CPU / Memory Utilization"
          view   = "timeSeries"
          stacked = false
          yAxis = { left = { label = "Percent", max = 100 } }
        }
      }
    ]
  })
}

resource "aws_cloudwatch_metric_alarm" "high_5xx_rate" {
  alarm_name          = "${var.name_prefix}-high-5xx-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ServerErrorCount"
  namespace           = "FitCorePro"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "5xx error rate > 5 errors in 10min"
  alarm_actions       = [var.sns_topic_arn]
  ok_actions          = [var.sns_topic_arn]
  tags                = local.tags
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.name_prefix}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  dimensions = {
    ServiceName = var.ecs_service_name
  }
  alarm_description   = "CPU > 80% for 10min"
  alarm_actions       = [var.sns_topic_arn]
  ok_actions          = [var.sns_topic_arn]
  tags                = local.tags
}

resource "aws_cloudwatch_metric_alarm" "high_db_connections" {
  alarm_name          = "${var.name_prefix}-high-db-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 40
  alarm_description   = "RDS connections > 40 for 10min"
  alarm_actions       = [var.sns_topic_arn]
  ok_actions          = [var.sns_topic_arn]
  tags                = local.tags
}
