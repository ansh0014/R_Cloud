module github.com/r-cloud/api-gateway

go 1.25.0

require (
	github.com/gorilla/mux v1.8.1
	github.com/gorilla/websocket v1.5.1
	github.com/joho/godotenv v1.5.1
	github.com/nats-io/nats.go v1.36.0
	github.com/r-cloud/infrastructure v0.0.0
	github.com/r-cloud/shared v0.0.0
)

require (
	github.com/klauspost/compress v1.17.2 // indirect
	github.com/nats-io/nkeys v0.4.7 // indirect
	github.com/nats-io/nuid v1.0.1 // indirect
	golang.org/x/crypto v0.54.0 // indirect
	golang.org/x/net v0.57.0 // indirect
	golang.org/x/sys v0.47.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

replace (
	github.com/r-cloud/infrastructure => ../../infrastructure
	github.com/r-cloud/shared => ../../shared
)
