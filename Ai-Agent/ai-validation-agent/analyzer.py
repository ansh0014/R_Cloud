import os
import json
from openai import AsyncOpenAI
from pydantic import BaseModel
from typing import List, Optional

from prompts import SYSTEM_PROMPT

# Use OpenAI SDK but configurable for any OpenAI-compatible endpoint (like Gemini via proxy, etc.)
# If the user provides OPENAI_API_KEY, it uses OpenAI.
client = AsyncOpenAI(api_key=os.getenv("LLM_API_KEY", "dummy-key"))

class SecurityAnalysis(BaseModel):
    issues: List[str]
    missing_env_vars: List[str]

class BestPractices(BaseModel):
    recommendations: List[str]

class ValidationReport(BaseModel):
    framework: str
    primary_purpose: str
    deployment_readiness_score: int
    security: SecurityAnalysis
    best_practices: BestPractices
    summary: str

async def analyze_repository(repo_structure: dict) -> dict:
    try:
        response = await client.chat.completions.create(
            model=os.getenv("LLM_MODEL", "gpt-4-turbo-preview"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this repository:\n\n{json.dumps(repo_structure, indent=2)}"}
            ],
            response_format={"type": "json_object"}
        )
        # Parse the JSON response
        result = json.loads(response.choices[0].message.content)
        # Ensure it matches the schema (basic validation)
        report = ValidationReport(**result)
        return report.model_dump()
    except Exception as e:
        return {"error": f"Failed to analyze repository: {str(e)}"}
