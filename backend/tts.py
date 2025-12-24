"""
Text-to-speech functionality using Google TTS
"""
import os
import uuid
from gtts import gTTS
from config import AUDIO_DIR


def text_to_speech(text: str) -> str:
    """
    Convert text to speech and save as MP3
    
    Args:
        text: The text to convert to speech
        
    Returns:
        str: Path to the generated audio file
    """
    # Create audio directory if it doesn't exist
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    # Generate MP3 file directly using gTTS
    file_id = uuid.uuid4()
    mp3_path = os.path.join(AUDIO_DIR, f"{file_id}.mp3")
    
    print(f"Generating audio at: {mp3_path}")
    
    try:
        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(mp3_path)
        print(f"MP3 file created: {os.path.exists(mp3_path)}")
        return mp3_path
    except Exception as e:
        print(f"Error generating audio: {e}")
        raise e
