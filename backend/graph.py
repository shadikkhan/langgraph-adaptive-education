"""
LangGraph workflow for generating age-appropriate explanations
"""
from langgraph.graph import StateGraph, END
from models import ExplainState
from config import llm


# -----------------------------
# GRAPH NODES
# -----------------------------
def simplify(state: ExplainState):
    """Simplify the topic for the given age level"""
    prompt = f"""
Explain "{state['topic']}" for someone who is {state['age']} years old.

Rules:
- Vocabulary appropriate for age {state['age']}
- Short sentences if age < 12
- Moderate detail if age 12–18
- Clear but concise if age > 18
- No jargon unless age > 20

No need to mention safety rules in output as bullet points at all. rules are for your internal use only. End user should only see the final safe text, no metadata needed as well.
Remove Here's a rewritten version or Here's an example or similar metadata if present.
"""
    return {"simplified": llm.invoke(prompt).strip()}


def example(state: ExplainState):
    """Generate a real-life example"""
    prompt = f"""
Give ONE real-life example suitable for age {state['age']}.

Concept:
{state['simplified']}

No need to mention safety rules in output as bullet points at all. rules are for your internal use only. End user should only see the final safe text, no metadata needed as well.
Remove Here's a rewritten version or Here's an example or similar metadata if present.
"""
    return {"example": llm.invoke(prompt).strip()}


def safety(state: ExplainState):
    """Ensure content is safe and age-appropriate"""
    prompt = f"""
Ensure this is SAFE and AGE-APPROPRIATE for age {state['age']}.

Text:
{state['simplified']}
Example:
{state['example']}

Rules:
- No violence
- No adult content
- No fear-based language
- Positive and encouraging tone
- Simple language

No need to mention safety rules in output as bullet points at all. rules are for your internal use only. End user should only see the final safe text, no metadata needed as well.
Remove Here's a rewritten version or Here's an example or similar metadata if present.
"""
    return {"safe_text": llm.invoke(prompt).strip()}


def question(state: ExplainState):
    """Generate a thinking question"""
    prompt = f"""
Create ONE thinking question suitable for age {state['age']}.

Based on:
{state['safe_text']}
No need to mention safety rules in output as bullet points at all. rules are for your internal use only. End user should only see the final safe text, no metadata needed as well.
Remove Here's a thinking question or similar metadata if present.
"""
    return {"question": llm.invoke(prompt).strip()}


def format_out(state: ExplainState):
    """Format the final output"""
    return {
        "output": {
            "topic": state["topic"],
            "age": state["age"],
            "explanation": state["safe_text"],
            "example": state["example"],
            "question":state["question"]
        }
    }


# -----------------------------
# BUILD GRAPH
# -----------------------------
def build_explain_graph():
    """Build and compile the explanation workflow graph"""
    graph = StateGraph(ExplainState)
    
    # Add nodes
    graph.add_node("simplify", simplify)
    graph.add_node("example", example)
    graph.add_node("safety", safety)
    graph.add_node("question", question)
    graph.add_node("format", format_out)
    
    # Define workflow
    graph.set_entry_point("simplify")
    graph.add_edge("simplify", "example")
    graph.add_edge("example", "safety")
    graph.add_edge("safety", "question")
    graph.add_edge("question", "format")
    graph.add_edge("format", END)
    
    return graph.compile()


# Initialize the graph
explain_graph = build_explain_graph()


# -----------------------------
# STREAMING FUNCTION
# -----------------------------
async def stream_explain_graph(topic: str, age: int, context: str = ""):
    """Stream the explanation generation process in real-time"""
    import re
    
    # Improved detection: check if this is an answer to a previous question
    is_answer = False
    if context and "Question:" in context:
        # Check if the input looks like an answer vs a question
        # Questions typically contain: question words, question marks, "what/how/why/when/where/who"
        question_indicators = ['?', 'what', 'how', 'why', 'when', 'where', 'who', 'which', 'explain', 'tell me']
        topic_lower = topic.lower()
        
        # If it has question indicators, it's likely a new question
        has_question_indicator = any(indicator in topic_lower for indicator in question_indicators)
        
        # If it's short (under 15 words) AND doesn't have question indicators, likely an answer
        is_short = len(topic.split()) < 15
        
        if is_short and not has_question_indicator:
            is_answer = True
    
    if is_answer:
        # Provide feedback on the answer
        yield {"type": "section", "section": "Feedback"}
        
        feedback_prompt = f"""
You are a helpful teacher evaluating a student's answer.

Student's age: {age}
Previous conversation:
{context}

Student's latest response: {topic}

Provide encouraging feedback:
- Acknowledge what they got right
- Gently correct any misconceptions
- Build on their understanding
- Keep it age-appropriate for {age} years old
- Be positive and encouraging

Keep your response conversational and friendly.
"""
        
        async for chunk in llm.astream(feedback_prompt):
            text = str(chunk)
            yield {"type": "content", "section": "Feedback", "text": text}
        return  # Exit early for answer feedback
    
    # Provide topic explanation
    # Step 1: Simplify
    yield {"type": "section", "section": "Explanation"}
    
    simplify_prompt = f"""
Explain "{topic}" for someone who is {age} years old.

Rules:
- Vocabulary appropriate for age {age}
- Short sentences if age < 12
- Moderate detail if age 12–18
- Clear but concise if age > 18
- No jargon unless age > 20

No need to mention safety rules in output as bullet points at all. rules are for your internal use only. End user should only see the final safe text, no metadata needed as well.
Remove Here's a rewritten version or Here's an example or similar metadata if present.
"""
    
    simplified_text = ""
    async for chunk in llm.astream(simplify_prompt):
        text = str(chunk)
        simplified_text += text
        yield {"type": "content", "section": "Explanation", "text": text}
    
    # Step 2: Example
    yield {"type": "section", "section": "Example"}
    
    example_prompt = f"""
Give ONE real-life example suitable for age {age}.

Concept:
{simplified_text}

No need to mention safety rules in output as bullet points at all. rules are for your internal use only. End user should only see the final safe text, no metadata needed as well.
Remove Here's a rewritten version or Here's an example or similar metadata if present.
"""
    
    example_text = ""
    async for chunk in llm.astream(example_prompt):
        text = str(chunk)
        example_text += text
        yield {"type": "content", "section": "Example", "text": text}
    
    # Step 3: Safety check and refinement
    safety_prompt = f"""
Ensure this is SAFE and AGE-APPROPRIATE for age {age}.

Text:
{simplified_text}
Example:
{example_text}

Rules:
- No violence
- No adult content
- No fear-based language
- Positive and encouraging tone
- Simple language

No need to mention safety rules in output as bullet points at all. rules are for your internal use only. End user should only see the final safe text, no metadata needed as well.
Remove Here's a rewritten version or Here's an example or similar metadata if present.
"""
    
    safe_text = ""
    async for chunk in llm.astream(safety_prompt):
        safe_text += str(chunk)
    
    # Update Explanation with safe text if different
    if safe_text and safe_text != simplified_text:
        # Extract useful content from safety check
        match = re.search(r"(Let's talk about.*)", safe_text, re.DOTALL)
        content = match.group(1) if match else safe_text
        content = re.sub(r"\n\s*\n", "\n\n", content).strip()
        
        if content != simplified_text:
            yield {"type": "update", "section": "Explanation", "text": content}
    
    # Step 4: Question
    yield {"type": "section", "section": "Question"}
    
    question_prompt = f"""
Create ONE thinking question suitable for age {age}.

Based on:
{safe_text if safe_text else simplified_text}
No need to mention safety rules in output as bullet points at all. rules are for your internal use only. End user should only see the final safe text, no metadata needed as well.
Remove Here's a thinking question or similar metadata if present.
"""
    
    async for chunk in llm.astream(question_prompt):
        text = str(chunk)
        yield {"type": "content", "section": "Question", "text": text}
