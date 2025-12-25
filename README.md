# Explain Like I'm 10 🎓

An intelligent, age-adaptive educational platform powered by **LangGraph** workflows and **local Ollama LLM** that generates personalized explanations for any topic based on the user's age and comprehension level.

> **Note**: This project uses **local Ollama** for running the language model. All AI processing happens on your machine - no cloud API calls required.

## 🌟 Project Overview

This project demonstrates advanced AI orchestration using **LangChain** and **LangGraph** to create a sophisticated educational assistant that:

- **Generates age-appropriate explanations** (ages 5-35) with real-time streaming
- **Creates relatable examples** tailored to the user's context
- **Produces thought-provoking follow-up questions** to enhance learning
- **Infers user intent** automatically (new question, answer, or follow-up)
- **Evaluates user answers** with encouraging, personalized feedback
- **Interactive Quiz Mode** with multiple-choice questions per chat
- **Ensures content safety** through multi-stage validation
- **Provides audio narration** using text-to-speech
- **Manages multi-conversation chat history** with local persistence (24-hour retention)
- **Supports voice input** using Web Speech API for hands-free interaction
- **Streams AI responses** in real-time for immediate engagement
- **Fully local AI** - runs entirely on your machine using Ollama

## 🧠 AI & Technology Stack

### Backend - AI Orchestration
- **LangGraph**: State machine-based workflow orchestration with intent inference
- **LangChain**: LLM integration framework with Ollama
- **Ollama (Local)**: Self-hosted LLM server running llama3.1:8b model locally
- **FastAPI**: High-performance async API framework with Server-Sent Events (SSE)
- **Pydantic**: Type-safe data validation and modeling
- **gTTS**: Google Text-to-Speech for audio generation

### Frontend - Modern React
- **React 18**: Component-based UI with hooks and modular architecture
- **Vite 7**: Next-generation frontend tooling and build system
- **Web Speech API**: Voice-to-text input support (webkitSpeechRecognition)
- **Server-Sent Events (SSE)**: Real-time streaming from backend
- **LocalStorage API**: Persistent chat storage with auto-cleanup
- **CSS Grid/Flexbox**: Responsive three-column layout with floating input box
- **Inter Font**: Professional typography
- **Environment Variables**: Configurable API endpoints

## 🔄 LangGraph Workflow Architecture

The application uses a **directed acyclic graph (DAG)** with **intelligent intent inference** to orchestrate the explanation generation process:

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       v
┌──────────────────────┐
│  Intent Inference    │  ← Analyze conversation history
│  (LLM-powered)       │    Classify: new_question | answer | followup
└──────┬───────────┬───┘
       │           │
   Answer?      Question?
       │           │
       v           v
┌─────────────┐  ┌─────────────────┐
│  Evaluate   │  │   Simplify      │  ← Generate age-appropriate explanation
│  Answer     │  │   (LLM Node)    │
│ (LLM Node)  │  └──────┬──────────┘
└─────────────┘         │
                        v
                 ┌─────────────────┐
                 │  Add Example    │  ← Create relatable example
                 │   (LLM Node)    │
                 └──────┬──────────┘
                        │
                        v
                 ┌─────────────────┐
                 │ Safety Check    │  ← Validate content appropriateness
                 │   (LLM Node)    │
                 └──────┬──────────┘
                        │
                        v
                 ┌─────────────────┐
                 │ Think Question  │  ← Generate thought-provoking question
                 │   (LLM Node)    │
                 └──────┬──────────┘
                        │
                        v
                 ┌─────────────┐
                 │  Format     │  ← Structure output based on intent
                 └──────┬──────┘
                        │
                        v
                 ┌─────────────┐
                 │     END     │
                 └─────────────┘
```

### Key LangGraph Features Demonstrated

1. **Intent Inference Node**: LLM-powered classification of user input
   ```python
   def infer_intent(state: ExplainState):
       # Uses LLM to determine: new_question, answer, or followup
       # Returns intent for conditional routing
   ```

2. **Conditional Routing**: Dynamic workflow based on inferred intent
   ```python
   def route_by_intent(state: ExplainState):
       intent = state.get("intent", "new_question")
       if intent == "answer":
           return "evaluate"
       else:
           return "simplify"
   ```

3. **Streaming State Management**: Real-time updates to conversation context
   ```python
   async def stream_explain_graph(topic: str, age: int, context: str = ""):
       # Infers intent, streams appropriate response
       # Yields streaming chunks for real-time UI updates
   ```

4. **Multi-Agent Reasoning**: Each node serves as a specialized agent
5. **Sequential Processing**: Ensures logical flow of explanation generation
6. **Context-Aware Processing**: Maintains full conversation history for intelligent responses

## 🎯 AI Capabilities & Skills Demonstrated

### 1. **Real-Time Streaming Architecture**
- **Server-Sent Events (SSE)**: Streams AI responses token-by-token
- **Async Processing**: Non-blocking response generation
- **Progressive Enhancement**: UI updates as content arrives
- **Optimistic UI**: Immediate feedback while AI processes

### 2. **Dynamic Prompt Engineering**
- Age-adaptive prompt templates
- Context-aware content generation with conversation history
- Multi-turn conversation handling
- Intent detection (answer vs. question recognition)

### 3. **Workflow Orchestration with LangGraph**
- **State Graph Design**: Manages complex multi-step AI workflows
- **Node Specialization**: Each LangGraph node has a specific responsibility
- **Conditional Routing**: Smart decision-making based on context
- **Edge Management**: Controls the flow between AI processing steps
- **State Persistence**: Maintains context throughout the workflow

### 4. **Interactive Learning Features**
- **Answer Evaluation**: AI provides encouraging feedback on user responses
- **Conversation Context**: Full chat history sent with each request
- **Intelligent Routing**: Automatically detects answers vs new questions
- **Follow-up Support**: Maintains topic coherence across multiple exchanges

### 5. **LLM Integration Patterns**
- **Ollama Integration**: Local LLM deployment for privacy and control
- **Temperature Control**: Fine-tuned for consistent, factual responses
- **Streaming Support**: Real-time response generation with `astream()`
- **Model Abstraction**: Easy to swap LLM providers

### 6. **Content Safety & Validation**
- Multi-stage safety checking
- Age-appropriate content filtering
- Automated content review pipeline

### 7. **Multimodal AI Pipeline**
- LLM for content generation
- TTS for audio output
- Speech-to-text for voice input (Web Speech API)
- Rule-based content parsing and formatting

## 📁 Project Structure

```
explain-10/
├── backend/                         # Python FastAPI backend
│   ├── main.py                     # Application entry point
│   ├── graph.py                    # LangGraph workflow definitions
│   ├── routes.py                   # API endpoints with SSE streaming
│   ├── models.py                   # Pydantic data models
│   ├── config.py                   # Configuration & Ollama setup
│   ├── tts.py                      # Text-to-speech integration
│   ├── topic_packs.py              # Pre-defined topic categories
│   ├── requirements.txt            # Python dependencies
│   ├── audio/                      # Generated audio files
│   └── README.md                   # Backend setup & API documentation
│
└── explain-like-im-10/             # React frontend
    ├── src/
    │   ├── components/             # Modular UI components
    │   │   ├── LeftSidebar.jsx    # Chat list navigation
    │   │   ├── RightSidebar.jsx   # Age slider & topic packs
    │   │   ├── QuizSetup.jsx      # Quiz configuration UI
    │   │   ├── QuizContainer.jsx  # Quiz questions & results
    │   │   ├── MessageList.jsx    # Chat message rendering
    │   │   └── InputBox.jsx       # Input with quiz/mic/send buttons
    │   ├── hooks/                  # Custom React hooks
    │   │   ├── useSpeechRecognition.js  # Voice input logic
    │   │   └── useChatStorage.js        # LocalStorage persistence
    │   ├── App.jsx                 # Main application container
    │   ├── App.css                 # Component-specific styles
    │   ├── index.css               # Global styles
    │   └── main.jsx                # React entry point
    ├── public/                     # Static assets
    ├── .env                        # Environment variables (not committed)
    ├── .env.example                # Environment template
    ├── package.json                # Node dependencies
    ├── vite.config.js              # Vite configuration
    └── README.md                   # Frontend setup & architecture
```

## 🚀 Quick Start

### Prerequisites

**Required:**
- **Ollama** - For running the local LLM ([Installation Guide](#step-1-install-ollama-locally))
- **Python 3.8+** - Backend runtime
- **Node.js 16+** - Frontend development

### Step 1: Install Ollama Locally

> **Important**: This project requires Ollama to be installed and running on your local machine. Ollama allows you to run large language models locally without sending data to cloud services.

#### macOS
```bash
# Install using Homebrew
brew install ollama

# Or download from https://ollama.ai
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
Download from: https://ollama.ai/download

### Step 2: Start Ollama and Pull Model

```bash
# Start Ollama service
ollama serve

# In a new terminal, pull the required model (~4.7GB)
ollama pull llama3.1:8b

# Verify installation
ollama list
```

### Step 3: Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Create audio directory
mkdir -p audio

# Start backend server
python main.py
```

Backend runs at: `http://localhost:8000`

### Step 4: Setup Frontend

```bash
cd explain-like-im-10

# Install dependencies
npm install

# Configure environment (optional - uses localhost:8000 by default)
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Step 5: Open Application

Visit `http://localhost:5173` in your browser and start learning!

## 📖 Detailed Setup

For detailed setup instructions, API documentation, and architecture details, see:
- **Backend**: [backend/README.md](backend/README.md) - Ollama setup, API endpoints, LangGraph workflow
- **Frontend**: [explain-like-im-10/README.md](explain-like-im-10/README.md) - Component architecture, state management

## 🎮 Usage Guide

Frontend runs at: `http://localhost:5173`

## 🎮 Usage Guide

### Starting a New Chat

1. Click "New Chat" button in the left sidebar
2. Ask any question or select from topic packs (right sidebar)
3. AI will stream a personalized explanation based on your age level
4. Each explanation includes:
   - **Explanation**: Age-appropriate answer
   - **Example**: Relatable real-world example
   - **Question**: Follow-up question to deepen understanding

### Using Quiz Mode

1. **Start a conversation** first (quiz button appears after first message)
2. Click the **🎯 quiz button** in the input box
3. **Configure quiz**:
   - Topic auto-fills from conversation
   - Select difficulty (Easy/Medium/Hard)
   - Adjust age level if needed
4. **Answer questions**: 5 multiple-choice questions with instant feedback
5. **Review results**: See score and detailed explanation for each question
6. **Retry or Exit**: Generate new quiz or return to explanation mode

### Voice Input

1. Click the **🎤 microphone button**
2. Speak your question
3. Click **⏹** to stop recording
4. Transcribed text appears in input box
5. Press **➤** send button or hit Enter

### Multi-Chat Management

- **Create**: Click "New Chat" for new conversation
- **Switch**: Click any chat in left sidebar to activate it
- **Persistence**: Chats saved for 24 hours in localStorage
- **Auto-cleanup**: Old chats automatically removed after expiration

### Adjusting Age Level

Use the **age slider** (5-35 years) in the right sidebar to customize:
- Vocabulary complexity
- Explanation depth
- Example relatability
- Question difficulty

## 📊 API Architecture

### Core Endpoints

#### POST /explain/stream
Streams explanations in real-time with intent inference
```json
{
  "topic": "Quantum Physics",
  "age": 15,
  "context": "Previous conversation history..."
}
```

**SSE Stream Events:**
```json
{"type": "intent", "intent": "new_question"}
{"type": "section", "section": "Explanation"}
{"type": "content", "section": "Explanation", "text": "Quantum physics is..."}
{"type": "section", "section": "Example"}
{"type": "content", "section": "Example", "text": "Imagine you have..."}
{"type": "section", "section": "Question"}
{"type": "content", "section": "Question", "text": "What do you think..."}
{"type": "audio", "url": "/audio/1703345678.mp3"}
{"type": "done"}
```

#### POST /quiz/generate
Generate interactive quiz questions
```json
{
  "topic": "Solar System",
  "age": 12,
  "num_questions": 5,
  "difficulty": "medium"
}
```

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

#### POST /quiz/evaluate
Evaluate quiz answer
```json
{
  "question": "How many planets are in our solar system?",
  "correct_answer": "A",
  "user_answer": "B",
  "age": 12
}
```

#### GET /topics
Returns categorized topic suggestions

#### GET /audio/{file_name}
Streams generated audio with proper CORS headers

## 🎨 Features

### 🧠 Intelligent Intent Inference
- **LLM-Powered Classification**: Automatically detects if user is:
  - Asking a new question
  - Answering a previous question
  - Asking a follow-up question
- **Context-Aware Routing**: Workflows adapt based on conversation history
- **Smart Feedback**: Encouraging responses when users answer questions

### 🎯 Interactive Quiz Mode
- **Topic-Based Quiz Generation**: Create quizzes on any subject
- **Difficulty Levels**: Easy, Medium, Hard with visual slider
- **Multiple Choice Format**: 4 options per question
- **Instant Feedback**: Visual indicators (green/red) for correct/incorrect
- **Score Tracking**: Real-time score and progress display
- **Comprehensive Review**: See all answers and explanations at the end
- **Retry Option**: Generate new quiz with same or different topic
- **Age-Appropriate Questions**: Content tailored to user's age level

### ⚡ Real-Time Streaming
- **Server-Sent Events (SSE)**: Token-by-token streaming from LLM
- **Progressive UI Updates**: Content appears as it's generated
- **Loading States**: Visual spinners and feedback during generation
- **Smooth Animations**: Typing cursor effect during streaming

### 🎭 Intelligent Adaptability
- **Age-Responsive**: Content complexity scales from ages 5 to 35
- **Context-Aware Examples**: Generates examples relevant to age group
- **Progressive Questioning**: Encourages critical thinking at appropriate levels
- **Conversation Memory**: Maintains context across multiple turns

### 🎮 User Experience
- **Dual Modes**: Switch between Explain and Quiz modes
- **Multi-Chat Support**: Manage multiple conversation threads
- **Auto-Scroll**: Seamless chat experience
- **Voice Input**: Speech-to-text with microphone button
- **Audio Playback**: Single-play enforcement across multiple messages
- **Topic Packs**: Quick-start with curated topics
- **Local Persistence**: Chats saved for 24 hours

### 🛠️ Technical Excellence
- **Type Safety**: Pydantic models for data validation
- **CORS Configured**: Secure cross-origin resource sharing
- **Clean Architecture**: Separation of concerns
- **Responsive Design**: Three-column grid layout with quiz mode
- **Error Handling**: Graceful fallbacks and user feedback

## 🔧 Configuration

### LLM Settings (`config.py`)
```python
LLM_MODEL = "llama3.1:8b"      # Model selection
LLM_TEMPERATURE = 0             # Deterministic responses
```

### Frontend Settings
- **Grid Layout**: `286px | 1fr | 330px` (left | center | right)
- **Age Range**: 5-35 years
- **Font**: Inter with system fallbacks

## 🌐 LangGraph Workflow Details

### Node Functions

**1. Simplify Node**
- Generates core explanation
- Adapts language complexity to age
- Maintains factual accuracy

**2. Add Example Node**
- Creates age-appropriate analogies
- Uses familiar scenarios
- Reinforces understanding

**3. Think Question Node**
- Generates critical thinking prompts
- Encourages deeper exploration
- Age-appropriate complexity

**4. Safety Check Node**
- Reviews content for appropriateness
- Filters mature themes
- Ensures educational value

### State Flow
```python
ExplainState → Simplify → Add Example → Think Question → Safety Check → Output
```

## � Troubleshooting

### Ollama Issues

**Problem**: "Connection refused" or "Failed to connect to Ollama"
```bash
# Solution: Check if Ollama is running
ollama serve

# In another terminal, verify:
curl http://localhost:11434
# Should return: "Ollama is running"
```

**Problem**: Model not found
```bash
# Solution: Pull the model again
ollama pull llama3.1:8b

# Verify it's installed
ollama list
```

**Problem**: Slow responses
- Ensure you have at least 8GB of RAM available
- Close other memory-intensive applications
- Check CPU usage with `top` or Activity Monitor
- Consider using a smaller model like `llama3.1:7b` if needed

**Problem**: Ollama service stops unexpectedly
```bash
# Restart Ollama
pkill ollama
ollama serve
```

### Backend Issues

**Problem**: Import errors or missing packages
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Problem**: Audio files not generating
```bash
# Ensure audio directory exists
mkdir -p backend/audio

# Check gTTS is working
python -c "from gtts import gTTS; print('gTTS OK')"
```

**Problem**: CORS errors
- Ensure frontend is running on `http://localhost:5173`
- Check `config.py` CORS settings include your frontend URL

### Frontend Issues

**Problem**: Voice input not working
- Use Chrome, Edge, or Safari (Web Speech API requirement)
- Grant microphone permissions when prompted
- Check browser console for errors

**Problem**: API connection failed
- Verify `.env` has correct `VITE_API_URL`
- Ensure backend is running on the configured port
- Check browser console for network errors

**Problem**: Chat history lost
- Chats expire after 24 hours (by design)
- Check browser localStorage isn't full
- Ensure localStorage isn't disabled in browser settings

## 📈 Skills Demonstrated

### AI/ML Engineering
✅ LangGraph workflow orchestration  
✅ LangChain LLM integration with local Ollama  
✅ Prompt engineering & optimization  
✅ State machine design  
✅ Multi-agent reasoning systems  
✅ Content safety & validation  
✅ Real-time streaming with SSE  
✅ Intent classification & routing  

### Backend Development
✅ FastAPI async architecture  
✅ RESTful API design  
✅ Server-Sent Events (SSE) streaming  
✅ CORS configuration  
✅ File streaming & management  
✅ Type-safe data modeling (Pydantic)  
✅ Local LLM integration  

### Frontend Development
✅ React 18 hooks & state management  
✅ Custom hooks (useSpeechRecognition, useChatStorage)  
✅ Modular component architecture  
✅ Responsive CSS Grid/Flexbox  
✅ Event handling & audio sync  
✅ LocalStorage persistence  
✅ SSE client implementation  
✅ Voice input (Web Speech API)  

### DevOps & Architecture
✅ Microservices design  
✅ Environment configuration (.env)  
✅ Dependency management  
✅ Documentation practices  
✅ Local-first architecture  

## 🔍 Use Cases

1. **Educational Technology**: Personalized learning experiences
2. **Content Adaptation**: Age-appropriate content generation
3. **AI Workflow Demonstration**: Complex LangGraph orchestration
4. **LLM Integration**: Local AI deployment patterns
5. **Full-Stack AI**: End-to-end AI application development

## 🎓 Learning Outcomes

This project showcases:
- **Advanced AI orchestration** using LangGraph state machines
- **Production-ready LLM integration** with Ollama and LangChain
- **Practical prompt engineering** for adaptive content generation
- **Full-stack AI application** development from backend to frontend
- **Best practices** in API design, state management, and user experience

## 📝 Documentation

- [Backend Documentation](backend/README.md) - API, setup, and architecture
- [Frontend Documentation](explain-like-im-10/README.md) - UI, features, and customization

## 🤝 Contributing

This project demonstrates best practices in:
- Type-safe AI workflows
- Modular architecture
- Comprehensive documentation
- Clean code principles

## 📄 License

MIT License - Feel free to use this project as a reference or starting point for your own AI-powered applications.

---

**Built with ❤️ using LangGraph, LangChain, and modern web technologies**

## UI Screens:

![Screen 1](screens/chat-1-1.png)

![Screen 2](screens/chat-1-2.png)

![Screen 3](screens/chat-2-1.png)

