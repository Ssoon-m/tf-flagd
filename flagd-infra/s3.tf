# S3 버킷
resource "aws_s3_bucket" "flagd_config" {
  bucket = "${var.s3_bucket_prefix}-${random_string.suffix.result}"
}

# 버킷 버전 관리 설정
resource "aws_s3_bucket_versioning" "flagd_config" {
  bucket = aws_s3_bucket.flagd_config.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 버킷 암호화 설정
resource "aws_s3_bucket_server_side_encryption_configuration" "flagd_config" {
  bucket = aws_s3_bucket.flagd_config.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 버킷 퍼블릭 액세스 차단 설정
resource "aws_s3_bucket_public_access_block" "flagd_config" {
  bucket = aws_s3_bucket.flagd_config.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront와 ECS 태스크가 S3에 접근할 수 있도록 하는 버킷 정책
resource "aws_s3_bucket_policy" "flagd_config" {
  bucket = aws_s3_bucket.flagd_config.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.main.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.flagd_config.arn}/*"
      },
      {
        Sid       = "AllowECSAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_iam_role.ecs_task_role.arn
        }
        Action   = ["s3:GetObject", "s3:ListBucket"]
        Resource = [
          aws_s3_bucket.flagd_config.arn,
          "${aws_s3_bucket.flagd_config.arn}/*"
        ]
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.flagd_config]
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
} 