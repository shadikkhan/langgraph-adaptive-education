"""
Data models for the Explain Like I'm 10 API
"""
from pydantic import BaseModel
from typing import TypedDict


class ExplainRequest(BaseModel):
    """Request model for the /explain endpoint"""
    topic: str
    age: int


class ExplainState(TypedDict):
    """State object for the LangGraph workflow"""
    topic: str
    age: int
    simplified: str
    example: str
    safe_text: str
    question: str
    output: dict
