import json
import re
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from app.core.config import settings
from app.utils.logging import logger
from app.utils.exceptions import LLMServiceError
from app.utils.prompts import (
    REQUIREMENT_EXTRACTION_SYSTEM_PROMPT,
    REQUIREMENT_EXTRACTION_USER_PROMPT,
    REQUIREMENT_CLASSIFICATION_SYSTEM_PROMPT,
    REQUIREMENT_CLASSIFICATION_USER_PROMPT,
    DRAFT_RESPONSE_SYSTEM_PROMPT,
    DRAFT_RESPONSE_USER_PROMPT
)
from app.schemas.requirement import ExtractedRequirement

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        if self.provider == "openai":
            self.openai_client = AsyncOpenAI(api_key=settings.LLM_API_KEY, base_url=settings.LLM_BASE_URL)
        elif self.provider == "anthropic":
            self.anthropic_client = AsyncAnthropic(api_key=settings.LLM_API_KEY)
        else:
            raise LLMServiceError(f"Unsupported LLM provider: {self.provider}")

    async def call_llm(self, system_prompt: str, user_prompt: str) -> str:
        try:
            if self.provider == "openai":
                response = await self.openai_client.chat.completions.create(
                    model=settings.LLM_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=settings.LLM_TEMPERATURE,
                    max_tokens=settings.LLM_MAX_TOKENS
                )
                return response.choices[0].message.content or ""
            elif self.provider == "anthropic":
                response = await self.anthropic_client.messages.create(
                    model=settings.LLM_MODEL,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=settings.LLM_TEMPERATURE,
                    max_tokens=settings.LLM_MAX_TOKENS
                )
                return response.content[0].text
            return ""
        except Exception as e:
            logger.error(f"Error calling LLM: {e}")
            raise LLMServiceError("Failed to communicate with LLM")

    async def extract_requirements_from_text(self, text: str) -> list[dict]:
        user_prompt = REQUIREMENT_EXTRACTION_USER_PROMPT.format(text=text)
        response_text = await self.call_llm(REQUIREMENT_EXTRACTION_SYSTEM_PROMPT, user_prompt)
        parsed = self._parse_json_response(response_text)
        
        if not isinstance(parsed, list):
            if isinstance(parsed, dict) and "requirements" in parsed:
                parsed = parsed["requirements"]
            else:
                parsed = [parsed]
        
        valid_reqs = []
        for r in parsed:
            if not isinstance(r, dict) or "requirement_text" not in r:
                continue
            r["category"] = self._validate_category(r.get("category", "General"))
            r["priority"] = self._validate_priority(r.get("priority", "Medium"))
            r["requirement_type"] = self._validate_requirement_type(r.get("requirement_type", "Mandatory"))
            valid_reqs.append(r)
            
        return valid_reqs

    async def classify_requirement(self, requirement_text: str) -> dict:
        user_prompt = REQUIREMENT_CLASSIFICATION_USER_PROMPT.format(requirement_text=requirement_text)
        response_text = await self.call_llm(REQUIREMENT_CLASSIFICATION_SYSTEM_PROMPT, user_prompt)
        parsed = self._parse_json_response(response_text)
        
        if not isinstance(parsed, dict):
            parsed = {}
            
        return {
            "category": self._validate_category(parsed.get("category", "General")),
            "priority": self._validate_priority(parsed.get("priority", "Medium")),
            "requirement_type": self._validate_requirement_type(parsed.get("requirement_type", "Mandatory"))
        }

    async def generate_draft_response(self, requirement_text: str, context_chunks: list[dict]) -> dict:
        context_str = ""
        for i, chunk in enumerate(context_chunks):
            context_str += f"--- Chunk {i+1} ---\nText: {chunk.get('text', '')}\nPage: {chunk.get('metadata', {}).get('page_number', 'N/A')}\nSection: {chunk.get('metadata', {}).get('section', 'N/A')}\n\n"
            
        user_prompt = DRAFT_RESPONSE_USER_PROMPT.format(requirement_text=requirement_text, context=context_str)
        response_text = await self.call_llm(DRAFT_RESPONSE_SYSTEM_PROMPT, user_prompt)
        
        parsed = self._parse_json_response(response_text)
        if not isinstance(parsed, dict):
            return {"response_text": response_text, "sources": []}
            
        return {
            "response_text": parsed.get("response_text", ""),
            "sources": parsed.get("sources", [])
        }

    def _parse_json_response(self, response: str) -> dict | list:
        # Strip markdown code blocks
        clean_text = re.sub(r'^```json\s*', '', response, flags=re.MULTILINE)
        clean_text = re.sub(r'^```\s*', '', clean_text, flags=re.MULTILINE)
        clean_text = clean_text.strip()
        try:
            return json.loads(clean_text)
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse LLM JSON response: {response}")
            return {}

    def _validate_category(self, category: str) -> str:
        allowed = ["Clinical", "Technical", "Security", "Compliance", "Financial", "Legal", "Operational", "General"]
        return category if category in allowed else "General"

    def _validate_priority(self, priority: str) -> str:
        allowed = ["Critical", "High", "Medium", "Low"]
        return priority if priority in allowed else "Medium"

    def _validate_requirement_type(self, req_type: str) -> str:
        allowed = ["Mandatory", "Optional", "Informational"]
        return req_type if req_type in allowed else "Mandatory"
