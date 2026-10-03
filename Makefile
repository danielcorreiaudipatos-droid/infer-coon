.PHONY: help docker-up docker-down docker-logs docker-db docker-api test build

help:
	@echo "OnNews Development Commands"
	@echo "============================"
	@echo "make docker-up      - Start all containers"
	@echo "make docker-down    - Stop all containers"
	@echo "make docker-logs    - View container logs"
	@echo "make docker-db      - Connect to database"
	@echo "make docker-api     - Bash into API container"
	@echo "make test           - Run backend tests"
	@echo "make build          - Build backend"

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-db:
	docker-compose exec db psql -U onnews_user -d onnews_db

docker-api:
	docker-compose exec api sh

test:
	cd api-onnews && npm test

build:
	cd api-onnews && npm run build

docker-build:
	docker-compose build

prune:
	docker system prune -af
