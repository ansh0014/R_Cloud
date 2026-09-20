#!/bin/bash
# ==============================================================================
# proto-gen.sh — Generate Go gRPC stubs from proto/*.proto
# Prerequisites:
#   - protoc installed locally (apt install protobuf-compiler)
#   - go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
#   - go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
# Run from the R_Cloud/ root directory:
#   bash scripts/proto-gen.sh
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Working directory: $ROOT_DIR"

# Create output directories
mkdir -p "$ROOT_DIR/shared/proto/common"
mkdir -p "$ROOT_DIR/shared/proto/runtime"

echo "Generating common.proto..."
protoc \
  --proto_path="$ROOT_DIR/proto" \
  --go_out="$ROOT_DIR/shared/proto/common" \
  --go_opt=paths=source_relative \
  "$ROOT_DIR/proto/common.proto"

echo "Generated: shared/proto/common/"

echo "Generating runtime.proto..."
protoc \
  --proto_path="$ROOT_DIR/proto" \
  --go_out="$ROOT_DIR/shared/proto/runtime" \
  --go_opt=paths=source_relative \
  --go-grpc_out="$ROOT_DIR/shared/proto/runtime" \
  --go-grpc_opt=paths=source_relative \
  "$ROOT_DIR/proto/runtime.proto"

echo "Generated: shared/proto/runtime/"
echo ""
echo "Proto generation complete!"
