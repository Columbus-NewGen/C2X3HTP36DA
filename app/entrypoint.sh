#!/bin/sh
set -e

: "${POSTGRES_USER:=gymmate}"
: "${POSTGRES_PASSWORD:=gymmate}"
: "${POSTGRES_DB:=gm-server-postgres-dev}"
: "${APP_ENV:=development}"
: "${BACKEND_PORT:=8080}"
: "${JWT_SECRET:=local-dev-secret-change-me}"
: "${REGISTER_SECRET:=local-register-secret}"
: "${CRON_SECRET:=local-cron-secret}"
: "${MINIO_DISABLED:=true}"

export RUNNING_MODE=container
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_USERNAME="$POSTGRES_USER"
export DATABASE_PASSWORD="$POSTGRES_PASSWORD"
export DATABASE_NAME="$POSTGRES_DB"
export DATABASE_SSLMODE="${DATABASE_SSLMODE:-disable}"
export JWT_SECRET
export REGISTER_SECRET
export CRON_SECRET
export MINIO_DISABLED
export BACKEND_PORT

exec supervisord -c /etc/supervisord.conf
