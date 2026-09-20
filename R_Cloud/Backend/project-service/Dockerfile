FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy local modules needed by replace directives in go.mod
COPY shared/ ./shared/
COPY infrastructure/ ./infrastructure/

WORKDIR /app/Backend/project-service

COPY Backend/project-service/go.mod Backend/project-service/go.sum ./
RUN go mod download

COPY Backend/project-service/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/project-service ./cmd/main.go

FROM alpine:3.19

WORKDIR /app
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/project-service /app/project-service

EXPOSE 8082

CMD ["/app/project-service"]
