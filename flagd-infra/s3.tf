# S3 버킷
resource "aws_s3_bucket" "flagd_config" {
  bucket = "${var.s3_bucket_prefix}-${random_string.suffix.result}"
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
} 