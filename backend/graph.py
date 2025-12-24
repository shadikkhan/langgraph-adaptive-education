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
