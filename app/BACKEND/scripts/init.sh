#!/bin/sh
set -e

PROJECT_NAME=${PROJECT_NAME:-gm-server}
DEV_DB="${PROJECT_NAME}-postgres-dev"
PROD_DB="${PROJECT_NAME}-postgres-prod"

echo "---------------------------------------------"
echo "Setting up PostgreSQL databases"
echo "Project: $PROJECT_NAME"
echo "Creating: $DEV_DB and $PROD_DB"
echo "---------------------------------------------"

# Connect to postgres database (always exists) to create our databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    -- Create development database (idempotent)
    SELECT 'CREATE DATABASE "$DEV_DB"'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DEV_DB')
\gexec

    -- Create production database (idempotent)
    SELECT 'CREATE DATABASE "$PROD_DB"'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$PROD_DB')
\gexec
EOSQL

# Setup development database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DEV_DB" <<-EOSQL
    -- Ensure public schema exists and is accessible
    CREATE SCHEMA IF NOT EXISTS public;
    GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
    GRANT ALL ON SCHEMA public TO public;
EOSQL

# Setup production database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$PROD_DB" <<-EOSQL
    -- Ensure public schema exists and is accessible
    CREATE SCHEMA IF NOT EXISTS public;
    GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
    GRANT ALL ON SCHEMA public TO public;
EOSQL

echo "---------------------------------------------"
echo "Database initialization completed"
echo "Created databases: $DEV_DB, $PROD_DB"
echo "---------------------------------------------"
