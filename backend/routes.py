"""
API route handlers
"""
import os
import json
from fastapi import APIRouter, Response
from fastapi.responses import FileResponse, StreamingResponse
from models import ExplainRequest
from graph import explain_graph, stream_explain_graph
from tts import text_to_speech
from topic_packs import TOPIC_PACKS
from config import AUDIO_DIR

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
