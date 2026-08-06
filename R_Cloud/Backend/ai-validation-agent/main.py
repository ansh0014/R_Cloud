import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from analyzer import analyze_repository

app = FastAPI(title="AI Validation Agent", description="Intelligent repository analysis assistant for R Agent Cloud.")

class AnalyzeRequest(BaseModel):
    repository_url: str
    repository_structure: dict
    validation_errors: list[str] = []

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-validation-agent"}

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not os.getenv("LLM_API_KEY"):
        raise HTTPException(status_code=500, detail="LLM_API_KEY is not configured")
    
    report = await analyze_repository(request.repository_structure)
    if "error" in report:
        raise HTTPException(status_code=500, detail=report["error"])
        
    return {
        "repository_url": request.repository_url,
        "ai_analysis": report,
        "static_validation_errors": request.validation_errors
    }
