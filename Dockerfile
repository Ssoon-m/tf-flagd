FROM ghcr.io/open-feature/flagd:latest

ENV FLAGD_URI=s3://flagd-config-2n7g8vmo/demo.flagd.json
ENV FLAGD_PORT=8013
ENV FLAGD_POLLING_INTERVAL=10s

EXPOSE 8013 8014

CMD ["start"]