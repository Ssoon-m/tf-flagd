# 기존 Route53 호스팅 영역 데이터 소스
data "aws_route53_zone" "main" {
  zone_id = "Z0452425102WETBTXMZLC"  # 실제 호스팅 영역 ID (ianlog.me)
}

# A 레코드 생성 (ALB용)
resource "aws_route53_record" "main" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${var.subdomain}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# CloudFront용 A 레코드
resource "aws_route53_record" "cdn" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "cdn.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
} 