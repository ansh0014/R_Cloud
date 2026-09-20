FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy local modules needed by replace directives in go.mod
COPY shared/ ./shared/
COPY infrastructure/ ./infrastructure/

WORKDIR /app/Backend/api-gateway

COPY Backend/api-gateway/go.mod Backend/api-gateway/go.sum ./
RUN go mod download

COPY Backend/api-gateway/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/api-gateway ./cmd/main.go

FROM alpine:3.19

WORKDIR /app
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/api-gateway /app/api-gateway

EXPOSE 8080

CMD ["/app/api-gateway"]
