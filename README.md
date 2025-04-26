# 🚀 flagd + OpenFeature Feature Flag 시스템

오픈소스 **flagd**와 **OpenFeature**를 활용해 Feature Flag 서버를 구축하고, React와 웹 기반 GUI로 실시간 플래그를 관리하는 프로젝트입니다.
AWS(S3, ECS, ECR) 배포와 JSON 기반 플래그 관리를 지원합니다.

> 📝 이 프로젝트는 [flagd와 OpenFeature로 구축하는 더 완벽한 Feature Flag](https://ianlog.me/blog/2025/open-feature-flagd) 블로그 글을 위한 데모 프로젝트입니다.

![flagd-openfeature-demo](https://res.cloudinary.com/ssoon/image/upload/f_auto,c_limit,q_auto/posts/blog/open-feature-flagd/flagd-openfeature.gif)

*실시간 플래그 변경 및 UI 반영 데모*


## ✨ 주요 기능
- **Feature Flag 서버**: flagd를 사용해 데이터베이스 없이 JSON으로 플래그 관리.
- **OpenFeature 통합**: React에서 표준화된 플래그 평가.
- **웹 기반 GUI**: variants 관리 (예정기능 : context 기반 조건 분기, 점진적 릴리스(rollout))
- **AWS 배포**: S3(JSON 저장), ECR(이미지), ECS(컨테이너)로 구축.
- **실시간 반영**: GUI로 JSON 수정 시 브라우저 새로고침 없이 UI 업데이트.

## 📁 프로젝트 구조

- **`.github/workflows`**
  - 깃헙 액션 워크플로우 설정 파일.
  - main 브랜치에서 푸시가 트리거될 경우 도커 이미지 빌드, ECR 푸시, ECS 배포를 위한 워크플로우

- **`flagd-gui`**
  - flagd JSON 파일을 관리하는 웹 기반 GUI 프로젝트. (s3에 업로드된 값 기준으로 ui를 그려줌)
  - 기본적인 variants기반 관리
    - 예정 기능 : context 기반 조건 분기, 점진적 릴리스(rollout) 지원.
  - 설정한 flag값 기준으로 s3에 업로드

- **`flagd-infra`**
  - flagd 서버를 AWS에 배포하기 위한 인프라 설정.
  - S3, ECS, ECR 설정 스크립트 및 Terraform 코드 포함.

- **`flagd-s3-uploader`**
  - S3에 JSON 파일을 업로드하기 위한 서버
  - flagd 서버가 S3에서 플래그를 가져오도록 설정 지원.
  - *참고*: `flagd-gui`와 함께 사용.

- **`openfeature-flagd-client`**
  - OpenFeature와 flagd를 연동한 React 클라이언트.
  - `useFlag` 훅으로 실시간 플래그 평가 구현.

- **`Dockerfile`**
  - flagd 서버를 컨테이너로 배포하기 위한 Dockerfile.
  - S3 URI, 포트(8013, 8014) 설정 포함.

- **`demo.flagd.json`**
  - flagd 서버가 사용하는 샘플 JSON 파일.
  - variants와 기본 플래그 설정 포함.
