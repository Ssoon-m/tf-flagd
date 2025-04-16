# CloudFront용 ACM 인증서 (us-east-1 리전)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "cloudfront" {
  provider          = aws.us_east_1
  domain_name       = "cdn.${var.domain_name}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Route53 인증서 검증 레코드
resource "aws_route53_record" "cert_validation_cloudfront" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = tolist(aws_acm_certificate.cloudfront.domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.cloudfront.domain_validation_options)[0].resource_record_type
  records = [tolist(aws_acm_certificate.cloudfront.domain_validation_options)[0].resource_record_value]
  ttl     = 60
}

# ACM 인증서 검증
resource "aws_acm_certificate_validation" "cloudfront" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cloudfront.arn
  validation_record_fqdns = [aws_route53_record.cert_validation_cloudfront.fqdn]
} 