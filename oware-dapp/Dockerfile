# syntax=docker.io/docker/dockerfile:1.4
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.12.0

RUN <<EOF
set -e
apt-get update
apt-get install -y --no-install-recommends \
  busybox-static=1:1.30.1-7ubuntu3 ca-certificates=20230311ubuntu0.22.04.1 curl build-essential python3-dev libopenblas0-serial libgomp1
rm -rf /var/lib/apt/lists/* 
EOF

WORKDIR /opt/cartesi/dapp

COPY ./requirements.txt .

RUN pip install -r requirements.txt --no-cache \
    && find /usr/local/lib -type d -name __pycache__ -exec rm -r {} +

COPY ./entrypoint.sh .
COPY ./game_play ./game_play
COPY ./utils ./utils
COPY ./oware.py .
