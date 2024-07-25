#!/bin/sh
docker-compose down --volumes
docker-compose --env-file .env down --rmi "all" -v