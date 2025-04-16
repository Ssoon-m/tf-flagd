# ECS 클러스터
resource "aws_ecs_cluster" "main" {
  name = "${var.subdomain}-cluster"
}

# ECS 태스크 정의
resource "aws_ecs_task_definition" "flagd" {
  family                   = var.subdomain
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                     = var.ecs_cpu
  memory                  = var.ecs_memory
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = var.subdomain
      image = "${aws_ecr_repository.flagd.repository_url}:latest"
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "FLAGD_CONFIG"
          value = "s3://${aws_s3_bucket.flagd_config.id}/demo.flagd.json"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.subdomain}"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# CloudWatch 로그 그룹
resource "aws_cloudwatch_log_group" "flagd" {
  name              = "/ecs/${var.subdomain}"
  retention_in_days = var.log_retention_days
}

# ECS 서비스
resource "aws_ecs_service" "main" {
  name            = "${var.subdomain}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.flagd.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = var.subdomain
    container_port   = var.container_port
  }
} 