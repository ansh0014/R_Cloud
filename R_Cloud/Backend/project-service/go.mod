module github.com/r-cloud/project-service

go 1.22

require (
	github.com/gorilla/mux v1.8.1
	github.com/joho/godotenv v1.5.1
	github.com/lib/pq v1.10.9
	github.com/r-cloud/shared v0.0.0
)

replace (
	github.com/r-cloud/infrastructure => ../../infrastructure
	github.com/r-cloud/shared => ../../shared
)
