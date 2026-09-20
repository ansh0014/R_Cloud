module github.com/r-cloud/project-service

go 1.25.0

require (
	github.com/gorilla/mux v1.8.1
	github.com/joho/godotenv v1.5.1
	github.com/lib/pq v1.10.9
	github.com/r-cloud/shared v0.0.0
)

require gopkg.in/yaml.v3 v3.0.1 // indirect

replace (
	github.com/r-cloud/infrastructure => ../../infrastructure
	github.com/r-cloud/shared => ../../shared
)
