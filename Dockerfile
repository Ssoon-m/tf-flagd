FROM ghcr.io/open-feature/flagd:latest

# 설정 파일은 이제 S3/CloudFront에서 받아오므로 제거
# COPY demo.flagd.json /etc/flagd/demo.flagd.json

ENV FLAGD_URI=https://cdn.ianlog.me/demo.flagd.json
ENV FLAGD_PORT=8013
ENV FLAGD_POLLING_INTERVAL=10s

EXPOSE 8013 8014

CMD ["start"]