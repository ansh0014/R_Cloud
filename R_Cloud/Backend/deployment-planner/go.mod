module github.com/r-cloud/deployment-planner

go 1.22

require (
	github.com/gorilla/mux v1.8.1
	github.com/joho/godotenv v1.5.1
	github.com/r-cloud/shared v0.0.0
	gopkg.in/yaml.v3 v3.0.1
)

replace (
	github.com/r-cloud/shared => ../../shared
)
