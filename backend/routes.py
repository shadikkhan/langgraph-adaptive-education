"""
API route handlers
"""
import os
import json
from fastapi import APIRouter, Response
from fastapi.responses import FileResponse, StreamingResponse
from models import ExplainRequest, QuizRequest, QuizAnswerRequest
from graph import explain_graph, stream_explain_graph
from tts import text_to_speech
from topic_packs import TOPIC_PACKS
from config import AUDIO_DIR, llm

import re

router = APIRouter()


@router.post("/explain")
def explain(req: ExplainRequest):
    """Generate an age-appropriate explanation with audio"""
    result = explain_graph.invoke({
        "topic": req.topic,
        "age": req.age
    })
 
    output = result["output"]
    display_sections_fomatted = {}
    extract_useful_content(output["explanation"], display_sections_fomatted)
    # print(f"Display sections formated: {display_sections_fomatted}")
    
    display_sections = {
        "Explanation": display_sections_fomatted.get("Explanation", ""),
        "Example": display_sections_fomatted.get("Example", "") if display_sections_fomatted.get("Example", "") else output["example"],
        "Question": output["question"]
    }

    sections_text = "\n\n".join([f"{label}: {text}" for label, text in display_sections.items()])
    audio_path = text_to_speech(sections_text)

    return {
        "sections": display_sections,
        "audio_url": f"/audio/{os.path.basename(audio_path)}"
    }


@router.post("/explain/stream")
async def explain_stream(req: ExplainRequest):
    """Stream age-appropriate explanation in real-time"""
    async def event_generator():
        accumulated_text = {
            "Explanation": "",
            "Example": "",
            "Question": "",
            "Feedback": ""
        }
        
        async for chunk in stream_explain_graph(req.topic, req.age, req.context):
            yield f"data: {json.dumps(chunk)}\n\n"
            
            # Accumulate text for audio generation
            if chunk.get("type") == "content":
                section = chunk.get("section", "")
                text = chunk.get("text", "")
                if section in accumulated_text:
                    accumulated_text[section] += text
        
        # Generate audio after all content is streamed
        sections_text = "\n\n".join([f"{label}: {text}" for label, text in accumulated_text.items() if text])
        audio_path = text_to_speech(sections_text)
        
        # Send final audio URL
        audio_chunk = {
            "type": "audio",
            "url": f"/audio/{os.path.basename(audio_path)}"
        }
        yield f"data: {json.dumps(audio_chunk)}\n\n"
        
        # Send completion signal
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.get("/topics")
def topics():
    """Get all available topic packs"""
    return TOPIC_PACKS


@router.options("/audio/{file_name}")
async def audio_options(file_name: str):
    """Handle OPTIONS preflight request for audio files"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )


@router.get("/audio/{file_name}")
def get_audio(file_name: str):
    """Serve audio files"""
    full_path = os.path.join(AUDIO_DIR, file_name)
    print(f"Full audio path: {full_path}")
    print(f"File exists: {os.path.exists(full_path)}")
    
    if not os.path.exists(full_path):
        return {"error": "File not found", "path": full_path}
    
    # Determine media type based on file extension
    media_type = "audio/mpeg" if file_name.endswith(".mp3") else "audio/wav"
    
    return FileResponse(
        full_path, 
        media_type=media_type,
        headers={
            "Accept-Ranges": "bytes",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Expose-Headers": "*"
        }
    )
    
def extract_useful_content(raw_text: str, display_sections: dict) -> None:
    """Extract and clean content, populating the display_sections dictionary"""
    # Clean the raw text (remove safety/meta notes)
    match = re.search(r"(Let's talk about.*)", raw_text, re.DOTALL)
    content = match.group(1) if match else raw_text
    content = re.sub(r"(Example:\s.*\n)(?=.*Example:)", r"", content, flags=re.DOTALL)
    content = re.sub(r"\n\s*\n", "\n\n", content).strip()

    # Split into sections for frontend
    sections = re.split(r"(?i)(Example:|Question:)", content)
    current_label = "Explanation"
    current_text = []

    for s in sections:
        s = s.strip()
        if not s:
            continue
        if s.startswith("Example:"):
            if current_text:
                display_sections[current_label] = " ".join(current_text)
            current_label = "Example"
            current_text = []
        elif s.startswith("Question:"):
            if current_text:
                display_sections[current_label] = " ".join(current_text)
            current_label = "Question"
            current_text = []
        else:
            current_text.append(s)
    
    # Add the last section
    if current_text:
        display_sections[current_label] = " ".join(current_text)


@router.post("/quiz/generate")
def generate_quiz(req: QuizRequest):
    """Generate quiz questions for a topic"""
    difficulty_map = {
        "easy": "simple, straightforward questions",
        "medium": "moderate difficulty with some critical thinking",
        "hard": "challenging questions requiring deep understanding"
    }
    
    prompt = f"""
Generate {req.num_questions} multiple-choice quiz questions about "{req.topic}" for someone who is {req.age} years old.

Difficulty: {difficulty_map[req.difficulty]}

For each question, provide:
1. The question text
2. Four answer options (A, B, C, D)
3. The correct answer (letter only)
4. A brief explanation

Format as JSON array:
[
  {{
    "question": "Question text here?",
    "options": {{
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    }},
    "correct": "A",
    "explanation": "Brief explanation of the correct answer"
  }}
]

Make questions age-appropriate for {req.age} years old.
"""
    
    response = llm.invoke(prompt)
    
    # Extract JSON from response
    import json
    try:
        # Try to find JSON in the response
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            questions = json.loads(json_match.group(0))
        else:
            questions = json.loads(response)
        
        return {"questions": questions, "topic": req.topic}
    except Exception as e:
        return {"error": f"Failed to parse quiz: {str(e)}", "raw_response": response}


@router.post("/quiz/evaluate")
def evaluate_quiz_answer(req: QuizAnswerRequest):
    """Evaluate a user's answer to a quiz question"""
    prompt = f"""
Evaluate this student's quiz answer:

Question: {req.question}
Correct Answer: {req.correct_answer}
Student's Answer: {req.user_answer}
Student's Age: {req.age}

Provide:
1. Is the answer correct? (yes/no)
2. Encouraging feedback appropriate for age {req.age}
3. Brief explanation if incorrect

Format as JSON:
{{
  "is_correct": true/false,
  "feedback": "Feedback message here",
  "explanation": "Explanation if needed"
}}
"""
    
    response = llm.invoke(prompt)
    
    try:
        # Try to find JSON in the response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group(0))
        else:
            result = json.loads(response)
        
        return result
    except Exception as e:
        # Fallback: simple text comparison
        is_correct = req.user_answer.strip().upper() == req.correct_answer.strip().upper()
        return {
            "is_correct": is_correct,
            "feedback": "Great job!" if is_correct else "Not quite right, but good try!",
            "explanation": ""
        }
