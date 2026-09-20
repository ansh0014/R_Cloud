FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy local modules needed by replace directives in go.mod
COPY shared/ ./shared/
COPY infrastructure/ ./infrastructure/

WORKDIR /app/Backend/Auth

COPY Backend/Auth/go.mod Backend/Auth/go.sum ./
RUN go mod download

COPY Backend/Auth/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/auth-service ./main.go

FROM alpine:3.19

WORKDIR /app
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/auth-service /app/auth-service

EXPOSE 8081

CMD ["/app/auth-service"]
