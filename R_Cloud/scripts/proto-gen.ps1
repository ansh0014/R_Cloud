# ==============================================================================
# proto-gen.ps1 — Generate Go gRPC stubs from proto/*.proto (Windows)
# Prerequisites:
#   - protoc installed (e.g., D:\protoc\bin\protoc.exe)
#   - go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
#   - go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
# Run from the R_Cloud/ root directory:
#   .\scripts\proto-gen.ps1
# ==============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$GoBin = "$(go env GOPATH)\bin"

Write-Host "Working directory: $RootDir" -ForegroundColor Cyan
Write-Host "Go bin: $GoBin" -ForegroundColor Cyan

# Create output directories
New-Item -ItemType Directory -Force -Path "$RootDir\shared\proto\common" | Out-Null
New-Item -ItemType Directory -Force -Path "$RootDir\shared\proto\runtime" | Out-Null

Write-Host "Generating common.proto..." -ForegroundColor Yellow

protoc `
  --proto_path="$RootDir\proto" `
  "--plugin=protoc-gen-go=$GoBin\protoc-gen-go.exe" `
  --go_out="$RootDir\shared\proto\common" `
  --go_opt=paths=source_relative `
  "$RootDir\proto\common.proto"

Write-Host "Generated: shared\proto\common\common.pb.go" -ForegroundColor Green

Write-Host "Generating runtime.proto..." -ForegroundColor Yellow

protoc `
  --proto_path="$RootDir\proto" `
  "--plugin=protoc-gen-go=$GoBin\protoc-gen-go.exe" `
  "--plugin=protoc-gen-go-grpc=$GoBin\protoc-gen-go-grpc.exe" `
  --go_out="$RootDir\shared\proto\runtime" `
  --go_opt=paths=source_relative `
  --go-grpc_out="$RootDir\shared\proto\runtime" `
  --go-grpc_opt=paths=source_relative `
  "$RootDir\proto\runtime.proto"

Write-Host "Generated: shared\proto\runtime\runtime.pb.go" -ForegroundColor Green
Write-Host "Generated: shared\proto\runtime\runtime_grpc.pb.go" -ForegroundColor Green
Write-Host ""
Write-Host "Proto generation complete!" -ForegroundColor Green
