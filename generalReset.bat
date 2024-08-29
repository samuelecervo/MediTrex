docker-compose down
docker-compose --env-file .env down --rmi "all" 
docker-compose down --volumes
rd /s /q containers\postgres\data
docker-compose --env-file .env build
docker-compose --env-file .env up -d