#!/bin/sh
docker-compose --env-file .env build
docker-compose --env-file .env up -d