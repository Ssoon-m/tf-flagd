FROM ghcr.io/open-feature/flagd:latest

COPY demo.flagd.json /etc/flagd/demo.flagd.json

ENV FLAGD_URI=file:/etc/flagd/demo.flagd.json
ENV FLAGD_PORT=8013
ENV FLAGD_POLLING_INTERVAL=10s

CMD ["start"]