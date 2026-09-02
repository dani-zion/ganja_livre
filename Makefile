.PHONY: help dev down build generate lint test sec clean

BINARY_API    = dist/server
BINARY_WORKER = dist/worker

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Local development ─────────────────────────────────────────────────────────

dev: ## Start full stack with Docker Compose (hot-reload via air)
	@cp -n .env.example .env 2>/dev/null || true
	docker compose up --build

down: ## Stop and remove containers (keep volumes)
	docker compose down

down-volumes: ## Stop containers AND delete all data volumes
	docker compose down -v

# ── Code generation ───────────────────────────────────────────────────────────

generate: ## Run gqlgen to regenerate GraphQL boilerplate
	go tool gqlgen generate

# ── Build ─────────────────────────────────────────────────────────────────────

build: ## Compile both binaries to ./dist
	@mkdir -p dist
	CGO_ENABLED=0 go build -ldflags="-w -s" -o $(BINARY_API)    ./cmd/server
	CGO_ENABLED=0 go build -ldflags="-w -s" -o $(BINARY_WORKER) ./cmd/worker
	@echo "Built: $(BINARY_API)  $(BINARY_WORKER)"

# ── Quality ───────────────────────────────────────────────────────────────────

lint: ## Run golangci-lint
	golangci-lint run ./...

test: ## Run all tests with race detector
	go test -race -cover ./...

sec: ## Run gosec security scanner
	gosec -quiet ./...

# ── Utilities ─────────────────────────────────────────────────────────────────

tidy: ## Tidy go.sum
	go mod tidy

clean: ## Remove build artifacts
	rm -rf dist/

gen-secrets: ## Print random JWT secrets to copy into .env
	@echo "JWT_ACCESS_SECRET=$$(openssl rand -hex 64)"
	@echo "JWT_REFRESH_SECRET=$$(openssl rand -hex 64)"
	@echo "MONGO_INITDB_ROOT_PASSWORD=$$(openssl rand -hex 32)"
	@echo "TEMPORAL_DB_PASSWORD=$$(openssl rand -hex 32)"
