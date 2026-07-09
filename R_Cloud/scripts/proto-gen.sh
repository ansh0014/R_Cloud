#!/bin/bash
# Generate Go code from protobuf using Docker

mkdir -p shared/proto/runtime

docker run --rm \
  -v "$(pwd):/workspace" \
  -w /workspace \
  rvolosatovs/protoc \
  --go_out=./shared/proto/runtime \
  --go_opt=paths=source_relative \
  --go-grpc_out=./shared/proto/runtime \
  --go-grpc_opt=paths=source_relative \
  proto/runtime.proto

echo "gRPC and Protobuf generation complete!"
