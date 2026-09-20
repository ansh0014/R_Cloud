FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy local modules needed by replace directives in go.mod
COPY shared/ ./shared/
COPY infrastructure/ ./infrastructure/

WORKDIR /app/Backend/validation-service

COPY Backend/validation-service/go.mod Backend/validation-service/go.sum ./
RUN go mod download

COPY Backend/validation-service/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/validation-service ./cmd/main.go

FROM alpine:3.19

WORKDIR /app
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/validation-service /app/validation-service

EXPOSE 8086

CMD ["/app/validation-service"]
