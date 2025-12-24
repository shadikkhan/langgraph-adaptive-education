# Explain Like I'm 10 - Backend API

This is the backend API for the "Explain Like I'm 10" application, which generates age-appropriate explanations using LangGraph and Ollama LLM.

## Architecture

The backend is built with:
- **FastAPI**: Web framework for building the API
- **LangGraph**: Workflow orchestration for generating explanations
- **Ollama**: Local LLM (llama3.1:8b) for generating content
- **gTTS**: Google Text-to-Speech for audio generation

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── routes.py            # API route handlers
├── graph.py             # LangGraph workflow definitions
├── models.py            # Pydantic models for request/response
├── config.py            # Configuration settings
├── tts.py               # Text-to-speech functionality
├── topic_packs.py       # Pre-defined topic categories
└── audio/               # Generated audio files directory
```

## Setup

### Prerequisites

1. **Python 3.8+** (Python 3.10 or higher recommended)
2. **pip** (Python package manager)
3. **Ollama** installed with llama3.1:8b model

### Step 1: Install Ollama

#### macOS
```bash
# Install Ollama using Homebrew
brew install ollama

# Or download from https://ollama.ai
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
Download and install from: https://ollama.ai/download

### Step 2: Pull the LLM Model

```bash
# Start Ollama service (if not auto-started)
ollama serve

# In a new terminal, pull the model
ollama pull llama3.1:8b
```

Verify the model is installed:
```bash
ollama list
```

### Step 3: Set Up Python Environment

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

## API Endpoints

### POST /explain

Generate an age-appropriate explanation for a topic.

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

The explanation generation follows this workflow:

1. **Simplify Node**: Generates age-appropriate explanation
2. **Add Example Node**: Creates a relatable example
3. **Think Question Node**: Generates a thought-provoking question
4. **Safety Check Node**: Ensures content is safe and appropriate

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
