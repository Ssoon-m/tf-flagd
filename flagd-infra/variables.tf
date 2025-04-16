variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "aws_profile" {
  description = "AWS profile"
  type        = string
  default     = "default"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidrs" {
  description = "CIDR blocks for subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "domain_name" {
  description = "Domain name for Route53"
  type        = string
  default     = "flagd.local"
}

variable "subdomain" {
  description = "Subdomain for Route53"
  type        = string
  default     = "flagd"
}

variable "ecs_cpu" {
  description = "CPU units for ECS task"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "Memory for ECS task"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "Desired count of ECS tasks"
  type        = number
  default     = 1
}

variable "s3_bucket_prefix" {
  description = "Prefix for S3 bucket name"
  type        = string
  default     = "flagd-config"
}

variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 30
}

variable "container_port" {
  description = "Port for the container"
  type        = number
  default     = 8013
}

variable "alb_port" {
  description = "Port for the ALB"
  type        = number
  default     = 80
} 