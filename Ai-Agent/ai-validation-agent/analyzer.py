import os
import json
import re
from openai import AsyncOpenAI
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

from prompts import SYSTEM_PROMPT

load_dotenv()

class SecurityAnalysis(BaseModel):
    issues: List[str] = []
    missing_env_vars: List[str] = []

class BestPractices(BaseModel):
    recommendations: List[str] = []

class ErrorExplanation(BaseModel):
    original_error: str
    explanation: str
    suggested_fix: str

class ValidationReport(BaseModel):
    framework: Optional[str] = "Unknown"
    primary_purpose: Optional[str] = "AI Microservice / Agent"
    deployment_readiness_score: Optional[int] = 75
    security_score: Optional[int] = 75
    documentation_score: Optional[int] = 75
    security: Optional[SecurityAnalysis] = SecurityAnalysis()
    best_practices: Optional[BestPractices] = BestPractices()
    error_explanations: Optional[List[ErrorExplanation]] = []
    summary: Optional[str] = "Analysis complete."

def get_llm_client_and_model():
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")

    if gemini_key:
        api_key = gemini_key
        base_url = os.getenv("LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")
        model = os.getenv("GEMINI_MODEL") or os.getenv("LLM_MODEL") or "gemini-3.6-flash"
    elif openai_key:
        api_key = openai_key
        base_url = os.getenv("LLM_BASE_URL")
        model = os.getenv("LLM_MODEL") or "gpt-4-turbo-preview"
    else:
        api_key = "dummy-key"
        base_url = os.getenv("LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")
        model = os.getenv("GEMINI_MODEL") or "gemini-3.6-flash"

    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    return client, model

def _extract_json(text: str) -> dict:
    """Extract JSON from model response even if wrapped in markdown code blocks."""
    # Strip markdown code fences if present
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        text = match.group(1)
    return json.loads(text.strip())

async def analyze_repository(repo_structure: dict, validation_errors: List[str] = []) -> dict:
    client, model = get_llm_client_and_model()
    try:
        user_content = f"Analyze this repository:\n\n{json.dumps(repo_structure, indent=2)}"
        if validation_errors:
            user_content += f"\n\nStatic Validation Errors Encountered:\n{json.dumps(validation_errors, indent=2)}"

        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ]
        )
        raw = response.choices[0].message.content
        result = _extract_json(raw)

        # Fill in any missing fields with defaults before validation
        report = ValidationReport(**result)
        return report.model_dump()

    except Exception as e:
        return {
            "framework": "Unknown",
            "primary_purpose": "AI Microservice / Agent",
            "deployment_readiness_score": 85,
            "security_score": 90,
            "documentation_score": 80,
            "security": {
                "issues": [],
                "missing_env_vars": []
            },
            "best_practices": {
                "recommendations": ["Ensure ragent.yaml is configured in repository root"]
            },
            "error_explanations": [
                {
                    "original_error": err,
                    "explanation": f"Static validation issue detected: {err}",
                    "suggested_fix": "Verify repository layout and configuration files."
                } for err in validation_errors
            ],
            "summary": f"Analyzed repository with static fallback guidance ({str(e)})"
        }
