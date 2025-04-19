# Flagd Infrastructure

이 프로젝트는 AWS 인프라에 Flagd 서비스를 배포하기 위한 Terraform 설정을 포함하고 있습니다.

## 인프라 구성 요소

### 핵심 서비스 컴포넌트
- `providers.tf`: AWS 프로바이더 설정
- `variables.tf`: 변수 정의
- `terraform.tfvars`: 변수 값 설정 (gitignore에 포함)

### 컨테이너 및 오케스트레이션
- `ecr.tf`: Flagd 컨테이너 이미지를 저장할 ECR 리포지토리 설정
- `ecs.tf`: Flagd 서비스를 실행할 ECS 클러스터, 태스크 정의, 서비스 설정

### 스토리지
- `s3.tf`: Flagd 설정 파일(예: demo.flagd.json)을 저장하는 S3 버킷 설정 (CloudFront와 연동)

### 네트워킹
- `network.tf`: VPC, 서브넷, 보안그룹 등 네트워크 관련 설정
- `alb.tf`: Application Load Balancer 설정
- `route53.tf`: DNS 설정
- `acm.tf`: SSL/TLS 인증서 설정

### 권한 관리
- `iam.tf`: IAM 역할 및 정책 설정

## 주요 기능

### Flagd 서비스
- ECS Fargate를 사용한 컨테이너 실행
- ALB를 통한 로드 밸런싱
- S3에서 설정 파일 로드

## 사용 방법

1. AWS 자격 증명 설정
```bash
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
```

2. Terraform 초기화 및 적용
```bash
terraform init
terraform plan
terraform apply
```

3. 설정 파일 업로드
- Flagd 설정 파일은 `s3.tf`에 정의된 버킷에 업로드

## 주의사항
- 실제 도메인 사용을 위해서는 Route53에서 도메인을 구매하거나 기존 도메인을 등록해야 합니다.
- SSL 인증서는 도메인 검증이 필요합니다.