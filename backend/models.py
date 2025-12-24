"""
Data models for the Explain Like I'm 10 API
"""
from pydantic import BaseModel
from typing import TypedDict, Literal


class ExplainRequest(BaseModel):
    """Request model for the /explain endpoint"""
    topic: str
    age: int
    context: str = ""  # Conversation history
    mode: Literal["explain", "quiz"] = "explain"  # Mode: explain or quiz


class QuizRequest(BaseModel):
    """Request model for quiz generation"""
    topic: str
    age: int
    num_questions: int = 5
    difficulty: Literal["easy", "medium", "hard"] = "medium"


class QuizAnswerRequest(BaseModel):
    """Request model for quiz answer evaluation"""
    question: str
    correct_answer: str
    user_answer: str
    age: int


class ExplainState(TypedDict):
    """State object for the LangGraph workflow"""
    topic: str
    age: int
    context: str
    intent: str  # 'new_question', 'answer', or 'followup'
    simplified: str
    example: str
    safe_text: str
    question: str
    feedback: str
    output: dict
