# syntax=docker.io/docker/dockerfile:1
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.14.1
ADD https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb /
RUN dpkg -i /machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb \
  && rm /machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb

  # Install tzdata and set the timezone to UTC
RUN apt-get update && apt-get install -y tzdata && \
ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && \
dpkg-reconfigure -f noninteractive tzdata

# Set up time synchronization
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN echo '#!/bin/sh' > /usr/local/bin/sync-time.sh && \
    echo 'date -s "$(curl -s --head http://google.com | grep ^Date: | sed 's/Date: //g')"' >> /usr/local/bin/sync-time.sh && \
    chmod +x /usr/local/bin/sync-time.sh

# If using Python, ensure it's using the system time
ENV PYTHONUNBUFFERED=1
ENV TZ=UTC

LABEL io.cartesi.rollups.sdk_version=0.9.0
LABEL io.cartesi.rollups.ram_size=128Mi

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -e
apt-get update
apt-get install -y --no-install-recommends \
  busybox-static=1:1.30.1-7ubuntu3 ca-certificates=20230311ubuntu0.22.04.1 curl build-essential python3-dev libopenblas0-serial libgomp1
rm -rf /var/lib/apt/lists/* /var/log/* /var/cache/*
useradd --create-home --user-group dapp
EOF

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp
COPY ./requirements.txt .

RUN <<EOF
set -e
pip install -r requirements.txt --no-cache
find /usr/local/lib -type d -name __pycache__ -exec rm -r {} +
EOF

COPY ./game_play ./game_play
COPY ./utils ./utils
COPY ./oware.py .

ENV ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004"

ENTRYPOINT ["rollup-init"]
CMD ["python3", "oware.py"]
