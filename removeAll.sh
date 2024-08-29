#!/bin/sh
docker-compose down --volumes
docker-compose --env-file .env down --rmi "all" -v
rm -f -r containers\postgres\data