FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy local modules needed by replace directives in go.mod
COPY shared/ ./shared/
COPY infrastructure/ ./infrastructure/

WORKDIR /app/Backend/deployment-service

COPY Backend/deployment-service/go.mod Backend/deployment-service/go.sum ./
RUN go mod download

COPY Backend/deployment-service/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/deployment-service ./cmd/main.go

FROM alpine:3.19

WORKDIR /app
RUN apk add --no-cache ca-certificates git

COPY --from=builder /app/deployment-service /app/deployment-service

EXPOSE 8083

CMD ["/app/deployment-service"]
