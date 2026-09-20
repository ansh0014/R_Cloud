# ==============================================================================
# R Agent Cloud - PowerShell Runner Script
# ==============================================================================

param (
    [string]$Service = "help"
)

function Show-Help {
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host " R Agent Cloud - Windows PowerShell Runner" -ForegroundColor White
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "Usage: .\run.ps1 <service-name>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Available Services:" -ForegroundColor White
    Write-Host "  install     - Install npm dependencies for Frontend & Runtime Service" -ForegroundColor Gray
    Write-Host "  gateway     - Run API Gateway (:8080)" -ForegroundColor Gray
    Write-Host "  auth        - Run Auth Service (:8081)" -ForegroundColor Gray
    Write-Host "  project     - Run Project Service (:8082)" -ForegroundColor Gray
    Write-Host "  deployment  - Run Deployment Service (:8083)" -ForegroundColor Gray
    Write-Host "  runtime     - Run Runtime Service (:8084 / :50051)" -ForegroundColor Gray
    Write-Host "  planner     - Run Deployment Planner (:8085)" -ForegroundColor Gray
    Write-Host "  validation  - Run Validation Service (:8086)" -ForegroundColor Gray
    Write-Host "  ai-agent    - Run AI Validation Agent with Gemini (:8087)" -ForegroundColor Gray
    Write-Host "  frontend    - Run Frontend Dashboard (:5173)" -ForegroundColor Gray
    Write-Host "  all         - Run all services concurrently" -ForegroundColor Gray
    Write-Host "=================================================================" -ForegroundColor Cyan
}

switch ($Service.ToLower()) {
    "install" {
        Write-Host "Installing Runtime Service dependencies..." -ForegroundColor Green
        Set-Location "Backend/runtime-service"; npm install; Set-Location "../.."
        Write-Host "Installing Frontend dependencies..." -ForegroundColor Green
        Set-Location "Frontend"; npm install; Set-Location ".."
        Write-Host "Setting up Python virtual environment and installing AI Agent dependencies..." -ForegroundColor Green
        Set-Location "../Ai-Agent/ai-validation-agent"
        if (-not (Test-Path ".venv")) { py -m venv .venv }
        .\.venv\Scripts\python.exe -m pip install --upgrade pip
        .\.venv\Scripts\python.exe -m pip install -r requirements.txt
        Set-Location "../../R_Cloud"
    }
    "gateway" { Set-Location "Backend/api-gateway"; go run cmd/main.go }
    "auth" { Set-Location "Backend/Auth"; go run main.go }
    "project" { Set-Location "Backend/project-service"; go run cmd/main.go }
    "deployment" { Set-Location "Backend/deployment-service"; go run cmd/main.go }
    "runtime" { Set-Location "Backend/runtime-service"; npm run dev }
    "planner" { Set-Location "Backend/deployment-planner"; go run cmd/main.go }
    "validation" { Set-Location "Backend/validation-service"; go run cmd/main.go }
    "ai-agent" {
        Set-Location "../Ai-Agent/ai-validation-agent"
        if (-not (Test-Path ".venv")) { py -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r requirements.txt }
        .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8087 --reload
    }
    "frontend" { Set-Location "Frontend"; npm run dev }
    "all" {
        Write-Host "Launching R Agent Cloud microservices in PowerShell..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/Backend/Auth'; go run main.go"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/Backend/project-service'; go run cmd/main.go"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/Backend/validation-service'; go run cmd/main.go"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/Backend/deployment-planner'; go run cmd/main.go"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/../Ai-Agent/ai-validation-agent'; if (-not (Test-Path '.venv')) { py -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r requirements.txt }; .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8087 --reload"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/Backend/runtime-service'; npm run dev"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/Backend/deployment-service'; go run cmd/main.go"
        Start-Sleep -Seconds 2
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/Backend/api-gateway'; go run cmd/main.go"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/Frontend'; npm run dev"
        Write-Host "All services launched in separate windows!" -ForegroundColor Green
    }
    Default { Show-Help }
}
