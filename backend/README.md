# Explain Like I'm 10 - Backend API

This is the backend API for the "Explain Like I'm 10" application, which generates age-appropriate explanations using LangGraph and **local Ollama LLM** with real-time streaming support, intent inference, and interactive quiz generation.

> **Note**: This project uses **local Ollama** for running language models. You must have Ollama installed and running on your machine to use this application.

## Architecture

The backend is built with:
- **FastAPI**: Web framework with async support and Server-Sent Events (SSE)
- **LangGraph**: Workflow orchestration with intelligent intent-based routing
- **Ollama (Local)**: Self-hosted LLM server running llama3.1:8b model locally
- **LangChain-Ollama**: Integration layer for Ollama with LangChain
- **gTTS**: Google Text-to-Speech for audio generation
- **Streaming AI**: Real-time response generation using `astream()` 

## Key Features

- ✨ **Real-time Streaming**: AI responses stream token-by-token for immediate user feedback
- 🧠 **Intent Inference**: LLM-powered classification of user input (new question, answer, or follow-up)
- 🎯 **Quiz Mode**: Generate and evaluate multiple-choice quizzes with difficulty levels
- 💬 **Context-Aware**: Maintains full conversation history for coherent responses
- 📝 **Answer Evaluation**: Provides encouraging feedback when users answer AI questions
- 🎚️ **Adaptive Difficulty**: Content tailored to user's age (5-35 years)
- 🔊 **Audio Generation**: Text-to-speech for all responses
- 🛡️ **Content Safety**: Multi-stage validation for age-appropriate content
- 🔄 **Conditional Routing**: Dynamic workflow paths based on conversation context
- 🏠 **Fully Local**: Runs entirely on your machine - no cloud API calls for AI

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── routes.py            # API route handlers with SSE streaming
├── graph.py             # LangGraph workflow with intent inference
├── models.py            # Pydantic models (ExplainRequest, QuizRequest, etc.)
├── config.py            # Configuration settings and LLM initialization
├── tts.py               # Text-to-speech functionality
├── topic_packs.py       # Pre-defined topic categories
├── requirements.txt     # Python dependencies
└── audio/               # Generated audio files directory
```

## Setup

### Prerequisites

1. **Python 3.8+** (Python 3.10 or higher recommended)
2. **pip** (Python package manager)
3. **Ollama** installed and running locally with llama3.1:8b model

### Step 1: Install Ollama Locally

> **Important**: This project requires Ollama to be installed and running on your local machine. Ollama allows you to run large language models locally without sending data to cloud services.

#### macOS
```bash
# Install Ollama using Homebrew
brew install ollama

# Or download the installer from https://ollama.ai
```

#### Linux
```bash
# Install using the official script
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
Download and install from: https://ollama.ai/download

### Step 2: Start Ollama Service

```bash
# Start the Ollama service (runs in the background)
ollama serve
```

The Ollama server will start on `http://localhost:11434` by default.

> **Tip**: You can check if Ollama is running by visiting http://localhost:11434 in your browser. You should see "Ollama is running".

### Step 3: Pull the Required LLM Model

```bash
# In a new terminal window, pull the llama3.1:8b model
ollama pull llama3.1:8b
```

This downloads the Llama 3.1 8B parameter model (~4.7GB). The download might take a few minutes depending on your internet speed.

Verify the model is installed:
```bash
ollama list
```

You should see `llama3.1:8b` in the list of installed models.

### Step 4: Test Ollama (Optional but Recommended)

```bash
# Test the model directly
ollama run llama3.1:8b "Explain gravity like I'm 10"
```

If you see a response, Ollama is working correctly!

### Step 5: Set Up Python Environment

#### Option A: Using Virtual Environment (Recommended)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Option B: Using System Python

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Create Audio Directory

```bash
# Create directory for audio files
mkdir -p audio
```

### Step 5: Verify Installation

```bash
# Check Python packages
pip list

# Verify key packages are installed:
# - fastapi
# - uvicorn
# - langgraph
# - langchain-ollama
# - gtts
```

## Quick Start Guide

### 1. Start Ollama Service

```bash
# Make sure Ollama is running
ollama serve
```

Keep this terminal open.

### 2. Start the Backend Server

Open a new terminal:

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if using one)
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Start the server
python main.py
```

The server will start at: `http://localhost:8000`

### 3. Verify the Server is Running

Open a browser and visit:
- API Docs: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

Or test with curl:
```bash
# Get topic packs
curl http://localhost:8000/topics

# Test explanation endpoint
curl -X POST http://localhost:8000/explain \
  -H "Content-Type: application/json" \
  -d '{"topic": "Plants", "age": 10}'
```

## Running the Server

### Important: Start Ollama First!

Before starting the backend, ensure Ollama is running:

```bash
# In a separate terminal
ollama serve
```

Verify Ollama is ready:
```bash
# Should show: "Ollama is running"
curl http://localhost:11434

# Test the model
ollama run llama3.1:8b "Hello"
```

### Development Mode (with auto-reload)

```bash
cd backend
python main.py
```

Or using uvicorn directly with custom options:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Running in Background (Linux/macOS)

```bash
nohup python main.py > server.log 2>&1 &
```

### Stopping the Server

```bash
# Find the process
ps aux | grep main.py

# Kill the process
kill <PID>

# Or use Ctrl+C in the terminal where it's running
```

The API will be available at `http://localhost:8000`

## Configuration

### Ollama Connection

The backend connects to local Ollama at `http://localhost:11434`. Configuration is in `config.py`:

```python
from langchain_ollama import OllamaLLM

# Model settings
LLM_MODEL = "llama3.1:8b"      # Model to use
LLM_TEMPERATURE = 0             # 0 = deterministic, higher = creative

llm = OllamaLLM(
    model=LLM_MODEL,
    temperature=LLM_TEMPERATURE
)
```

**Using a Different Model:**
1. Pull the model: `ollama pull <model-name>`
2. Update `LLM_MODEL` in `config.py`
3. Restart the backend

**Recommended Models:**
- `llama3.1:8b` - Best balance (~4.7GB) ⭐ Default
- `llama3.1:70b` - More capable (~40GB, requires powerful hardware)
- `mistral` - Alternative option (~4GB)
- `phi3` - Faster, smaller (~2.3GB)

Run `ollama list` to see installed models.

### Environment Variables (Optional)

```bash
# Use Ollama on a different machine
export OLLAMA_HOST=http://192.168.1.100:11434
python main.py

# Change port
export PORT=8080
python main.py
```

## API Endpoints

### POST /explain/stream

Generate an age-appropriate explanation with real-time streaming and intent inference.

**Request Body:**
```json
{
  "topic": "Plants",
  "age": 10,
  "context": "Previous conversation history (optional)",
  "mode": "explain"
}
```

**Response:** Server-Sent Events (SSE) stream

**Event Types:**
```javascript
// Intent inference result
{ "type": "intent", "intent": "new_question" }  // or "answer" or "followup"

// Section start
{ "type": "section", "section": "Explanation" }

// Content chunk (streamed in real-time)
{ "type": "content", "section": "Explanation", "text": "Plants are " }
{ "type": "content", "section": "Explanation", "text": "amazing " }

// For answer evaluation
{ "type": "section", "section": "Feedback" }
{ "type": "content", "section": "Feedback", "text": "Great answer! " }

// Audio ready
{ "type": "audio", "url": "/audio/1234567890.mp3" }

// Stream complete
{ "type": "done" }
```

**Example with curl:**
```bash
curl -N -X POST http://localhost:8000/explain/stream \
  -H "Content-Type: application/json" \
  -d '{"topic": "photosynthesis", "age": 12, "context": ""}'
```

### POST /quiz/generate

Generate a multiple-choice quiz on any topic.

**Request Body:**
```json
{
  "topic": "Solar System",
  "age": 12,
  "num_questions": 5,
  "difficulty": "medium"
}
```

**Parameters:**
- `topic` (string, required): The subject for quiz questions
- `age` (int, required): User's age for appropriate difficulty
- `num_questions` (int, optional): Number of questions (default: 5)
- `difficulty` (string, optional): "easy", "medium", or "hard" (default: "medium")

**Response:**
```json
{
  "questions": [
    {
      "question": "How many planets are in our solar system?",
      "options": {
        "A": "8 planets",
        "B": "9 planets",
        "C": "7 planets",
        "D": "10 planets"
      },
      "correct": "A",
      "explanation": "There are 8 planets since Pluto was reclassified as a dwarf planet in 2006."
    }
  ],
  "topic": "Solar System"
}
```

### POST /quiz/evaluate

Evaluate a quiz answer with encouraging feedback.

**Request Body:**
```json
{
  "question": "How many planets are in our solar system?",
  "correct_answer": "A",
  "user_answer": "B",
  "age": 12
}
```

**Response:**
```json
{
  "is_correct": false,
  "feedback": "Not quite, but good try! The correct answer is A. There are 8 planets in our solar system.",
  "explanation": "Pluto was reclassified as a dwarf planet in 2006, leaving 8 major planets."
}
```

**Intelligent Routing:**
- If `context` contains a question and `topic` is short (< 15 words) without question indicators → Returns **Feedback** section
- Otherwise → Returns **Explanation**, **Example**, **Question** sections

### POST /explain

Generate explanation (non-streaming, legacy).

**Request Body:**
```json
{
  "topic": "Plants",
  "age": 10
}
```

**Response:**
```json
{
  "sections": {
    "Explanation": "Plants are amazing living things...",
    "Example": "Imagine you're on a camping trip...",
    "Question": "What would happen if plants stopped..."
  },
  "audio_url": "/audio/1234567890.mp3"
}
```

### GET /topics

Get all available topic packs.

**Response:**
```json
{
  "Science": ["Plants", "Solar System", "Gravity"],
  "Technology": ["Internet", "AI", "Computers"]
}
```

### GET /audio/{file_name}

Stream an audio file.

**Example:** `http://localhost:8000/audio/1234567890.mp3`

## LangGraph Workflow

The explanation generation follows an intelligent workflow:

### For New Questions:
1. **Simplify Node**: Generates age-appropriate explanation (streaming)
2. **Add Example Node**: Creates a relatable example (streaming)
3. **Safety Check Node**: Ensures content is safe and appropriate
4. **Think Question Node**: Generates a thought-provoking question (streaming)

### For Answers (detected via context):
1. **Context Analysis**: Detects if user is answering a previous question
2. **Feedback Node**: Provides encouraging, personalized feedback (streaming)

**Answer Detection Logic:**
- Checks conversation `context` for previous questions
- Analyzes input for question indicators: `?`, `what`, `how`, `why`, etc.
- If input is short (<15 words) AND lacks question indicators → treats as answer
- Otherwise → treats as new question

## Configuration

Edit `config.py` to customize:

- **LLM Model**: Change `LLM_MODEL` (default: llama3.1:8b)
- **Temperature**: Adjust `LLM_TEMPERATURE` (default: 0)
- **CORS Settings**: Modify allowed origins, methods, headers
- **Audio Directory**: Change `AUDIO_DIR` path

## CORS Configuration

The API is configured to allow:
- All origins (`*`)
- All HTTP methods
- All headers
- Credentials: False (required for wildcard origins)

## Text-to-Speech

Audio files are generated using Google Text-to-Speech (gTTS) and saved as MP3 files in the `audio/` directory. Files are named with Unix timestamps.

## Error Handling

The API includes:
- File existence checks for audio files
- Error responses with detailed messages
- CORS headers on all responses including errors

## Development

### Adding New Topic Packs

Edit `topic_packs.py`:

```python
TOPIC_PACKS = {
    "Your Category": [
        "Topic 1",
        "Topic 2"
    ]
}
```

### Modifying the Workflow

Edit `graph.py` to add/modify nodes in the LangGraph workflow:

```python
def your_new_node(state: ExplainState):
    # Your logic here
    return {"your_field": "value"}

# Add to graph
graph.add_node("your_node", your_new_node)
graph.add_edge("previous_node", "your_node")
```

## Troubleshooting

### Ollama Connection Issues

**Problem**: `Error: Ollama connection failed`

**Solution**:
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama if not running
ollama serve

# Verify the model is available
ollama list

# Pull the model if not installed
ollama pull llama3.1:8b

# Test the model directly
ollama run llama3.1:8b "Hello, tell me about plants"
```

### Module Import Errors

**Problem**: `ModuleNotFoundError: No module named 'langgraph'`

**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep langgraph
```

### Port Already in Use

**Problem**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
# macOS/Linux:
lsof -i :8000

# Windows:
netstat -ano | findstr :8000

# Kill the process
kill <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
uvicorn main:app --port 8001
```

### Audio File Not Found

**Problem**: Audio endpoint returns 404

**Solution**:
```bash
# Check if audio directory exists
ls -la audio/

# Create if missing
mkdir -p audio

# Check file permissions
chmod 755 audio

# Verify files are being created
tail -f server.log  # if running in background
```

### CORS Errors

**Problem**: Frontend can't connect due to CORS

**Solution**:
- Verify `config.py` CORS settings allow your frontend origin
- Check that frontend URL matches allowed origins
- Ensure browser console shows the exact CORS error
- Test with curl to verify API works:
```bash
curl -X POST http://localhost:8000/explain \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"topic": "test", "age": 10}'
```

### Slow Response Times

**Problem**: API takes too long to respond

**Solution**:
- Check Ollama performance: `ollama run llama3.1:8b "test"`
- Monitor system resources (CPU, RAM)
- Consider using a smaller model for faster responses
- Increase timeout in config if needed

### Permission Denied Errors

**Problem**: Can't write audio files

**Solution**:
```bash
# Fix audio directory permissions
chmod 755 audio
chown $USER audio

# Check disk space
df -h
```

## License

MIT
