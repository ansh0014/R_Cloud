FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy local modules needed by replace directives in go.mod
COPY shared/ ./shared/
COPY infrastructure/ ./infrastructure/

WORKDIR /app/Backend/deployment-planner

COPY Backend/deployment-planner/go.mod Backend/deployment-planner/go.sum ./
RUN go mod download

COPY Backend/deployment-planner/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/deployment-planner ./cmd/main.go

FROM alpine:3.19

WORKDIR /app
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/deployment-planner /app/deployment-planner

EXPOSE 8085

CMD ["/app/deployment-planner"]
