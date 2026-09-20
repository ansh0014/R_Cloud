import os
import traceback
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from analyzer import analyze_repository

load_dotenv()

app = FastAPI(
    title="AI Validation Agent",
    description="Intelligent repository analysis and advisory assistant for R Agent Cloud using Google Gemini."
)

class AnalyzeRequest(BaseModel):
    repository_url: Optional[str] = ""
    repository_structure: dict
    validation_errors: Optional[List[str]] = []

@app.get("/health")
async def health_check():
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    llm_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
    configured_provider = "gemini" if gemini_key else ("openai" if llm_key else "none")

    return {
        "status": "healthy",
        "service": "ai-validation-agent",
        "llm_configured": bool(gemini_key or llm_key),
        "provider": configured_provider,
        "model": os.getenv("GEMINI_MODEL") or os.getenv("LLM_MODEL") or "gemini-2.5-flash"
    }

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        report = await analyze_repository(
            request.repository_structure,
            request.validation_errors or []
        )
        return {
            "repository_url": request.repository_url,
            "ai_analysis": report,
            "static_validation_errors": request.validation_errors or []
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Analysis failed",
                "message": str(e),
                "fallback": {
                    "deployment_readiness_score": 75,
                    "security_score": 80,
                    "documentation_score": 70,
                    "summary": f"Static fallback analysis — AI call failed: {str(e)}"
                }
            }
        )
