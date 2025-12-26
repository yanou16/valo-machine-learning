"""
Groq LLM Client for Scouting Report Generation.
Uses Llama 3 for fast, free inference.
"""
import os
import httpx
from typing import Optional


class GroqClient:
    """Client for Groq Cloud API."""
    
    BASE_URL = "https://api.groq.com/openai/v1/chat/completions"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not set")
    
    async def generate(
        self, 
        prompt: str, 
        system_prompt: str = "",
        model: str = "llama-3.3-70b-versatile",
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> str:
        """
        Generate text using Groq's Llama model.
        
        Args:
            prompt: User prompt
            system_prompt: System instructions
            model: Groq model to use (llama-3.3-70b-versatile recommended)
            max_tokens: Max response length
            temperature: Creativity (0-1)
        
        Returns:
            Generated text
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                self.BASE_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Groq API error: {response.status_code} - {response.text}")
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
