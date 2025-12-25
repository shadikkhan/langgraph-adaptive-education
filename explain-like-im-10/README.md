# Explain Like I'm 10 - Frontend

A modern React application that provides age-appropriate explanations for various topics using AI with real-time streaming, voice input, and interactive quiz mode. Built with React 18, Vite, and modular component architecture.

## Features

### 🎯 Core Functionality
- **Multi-Chat Support**: Create and manage multiple conversation threads simultaneously
- **Per-Chat Quiz Mode**: Each conversation can have its own quiz based on the chat topic
- **Real-Time Streaming**: AI responses stream live as they're generated
- **Voice Input**: Speech-to-text using Web Speech API for hands-free interaction
- **Audio Playback**: Text-to-speech narration of explanations

### 🧠 Intelligent Features
- **Intent Inference**: AI automatically detects if you're asking a question or answering one
- **Context-Aware**: Maintains conversation history for coherent multi-turn dialogues
- **Age-Appropriate**: Customize explanations based on age level (5-35 years)
- **Answer Evaluation**: AI provides encouraging feedback when you answer questions
- **Conditional Rendering**: Empty AI sections (Explanation, Example, Question) are hidden automatically

### ⚡ Real-Time Experience
- **Streaming Responses**: AI responses appear live as they're generated with typing cursor
- **Loading States**: Visual feedback with spinners during generation
- **Auto-Scroll**: Seamless navigation to latest messages
- **Optimistic Updates**: Instant UI feedback for better UX

### 🎮 Quiz Mode Features (Per-Chat)
- **Topic-Based Quizzes**: Quiz button appears after first message in each chat
- **Setup Screen**: Configure topic (pre-filled with chat topic), difficulty, and age
- **Difficulty Levels**: Visual slider for Easy, Medium, or Hard
- **5 Multiple-Choice Questions**: With visual feedback and explanations
- **Instant Feedback**: Green (correct) or red (incorrect) indicators
- **Score Tracking**: Real-time score and progress display
- **Comprehensive Review**: See all answers and explanations at the end
- **Retry/Exit Options**: Generate new quiz or return to explanation mode

### 💬 Chat Management
- **Multi-Chat Interface**: Left sidebar shows all active conversations
- **Chat Persistence**: Conversations saved in localStorage for 24 hours
- **Auto-Cleanup**: Expired chats automatically removed
- **New Chat Creation**: Start fresh conversations anytime
- **Active Chat Highlighting**: Visual indicator for current conversation

### 🎤 Input Methods
- **Voice Input**: 🎤 button for speech-to-text (Chrome, Edge, Safari)
- **Text Input**: Multi-line textarea with keyboard shortcuts (Enter to send)
- **Quiz Button**: 🎯 icon appears inline with send button after first message
- **Quick Topics**: Pre-defined topic packs for quick start

### 🎨 User Interface
- **Three-Column Layout**: 
  - Left: Chat list
  - Center: Active conversation or quiz
  - Right: Age slider and topic packs
- **Floating Input Box**: Elevated design with shadow for better focus
- **Compact Icon Buttons**: Space-efficient 🎯, 🎤, ➤ buttons
- **Color-Coded Sections**: Visual distinction for Explanation, Example, Question, Feedback
- **Responsive Design**: Adapts to different screen sizes
- **Scrollable Quiz Results**: Full review with overflow support
- **Modern Styling**: Clean, professional design with Inter font

## Tech Stack

- **React 18**: UI framework with functional components and hooks
- **Vite 7**: Next-generation build tool and dev server
- **Server-Sent Events (SSE)**: Real-time streaming from backend
- **Web Speech API**: Voice-to-text input (webkitSpeechRecognition)
- **LocalStorage API**: Persistent chat storage with auto-cleanup
- **CSS3**: Custom styling with flexbox/grid layouts
- **Inter Font**: Professional typography
- **Environment Variables**: Configurable API endpoint via `.env`

## Project Structure (Modular Architecture)

```
explain-like-im-10/
├── public/                      # Static assets
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── LeftSidebar.jsx     # Chat list navigation
│   │   ├── RightSidebar.jsx    # Age slider and topic packs
│   │   ├── QuizSetup.jsx       # Quiz configuration UI
│   │   ├── QuizContainer.jsx   # Quiz questions and results
│   │   ├── MessageList.jsx     # Chat message rendering
│   │   └── InputBox.jsx        # Message input with buttons
│   ├── hooks/                   # Custom React hooks
│   │   ├── useSpeechRecognition.js  # Voice input logic
│   │   └── useChatStorage.js        # LocalStorage persistence
│   ├── App.jsx                  # Main application container
│   ├── App.css                  # Component-specific styles
│   ├── index.css                # Global styles and layout
│   ├── main.jsx                 # Application entry point
│   └── assets/                  # Images and other assets
├── .env                         # Environment variables (not committed)
├── .env.example                 # Environment template
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

## Setup

### Prerequisites

- **Node.js 16+** and npm
- **Backend API** running on `http://localhost:8000` (or configured in `.env`)
- **Ollama** installed and running locally (see backend README)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd explain-10/explain-like-im-10
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env if your backend runs on a different URL
   # VITE_API_URL=http://localhost:8000
   ```

4. **Ensure backend is running** (see backend README):
   ```bash
   # In a separate terminal, start Ollama
   ollama serve
   
   # Start the backend server
   cd ../backend
   python main.py
   ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Application Architecture

### Component Structure

#### 1. **App Component** (`App.jsx`)
Main application container that manages:
- **State Management**: Chats, active chat, age, topic packs
- **Custom Hooks**: Speech recognition and localStorage persistence
- **API Integration**: Fetch topic packs, stream explanations, generate quizzes
- **Event Handlers**: Send messages, quiz flow, answer submission
- **Component Composition**: Renders all child components with props

#### 2. **LeftSidebar** (`components/LeftSidebar.jsx`)
- Displays list of all chats
- Highlights active chat
- "New Chat" button
- Handles chat selection

#### 3. **RightSidebar** (`components/RightSidebar.jsx`)
- Age slider (5-35 years)
- Topic pack selector
- Quick topic buttons

#### 4. **QuizSetup** (`components/QuizSetup.jsx`)
- Quiz topic input (pre-filled with chat topic)
- Difficulty level slider (Easy/Medium/Hard)
- Age level slider
- Generate/Cancel buttons
- Loading state during quiz generation

#### 5. **QuizContainer** (`components/QuizContainer.jsx`)
- Question display with progress
- Multiple-choice options (A, B, C, D)
- Instant feedback (correct/incorrect)
- Score tracking
- Results screen with full review
- Retry/Exit buttons

#### 6. **MessageList** (`components/MessageList.jsx`)
- Renders chat messages (user/assistant)
- Conditional section rendering (Explanation, Example, Question, Feedback)
- Streaming cursor animation
- Audio playback controls
- Auto-scroll to bottom reference

#### 7. **InputBox** (`components/InputBox.jsx`)
- Multi-line textarea
- Quiz button (🎯) - appears after first message
- Voice input button (🎤) - with listening indicator
- Send button (➤)
- Keyboard shortcuts (Enter to send)

### Custom Hooks

#### 1. **useSpeechRecognition** (`hooks/useSpeechRecognition.js`)
Handles voice input functionality:
```javascript
const { isListening, toggleListening } = useSpeechRecognition(setInput);
```
- Initializes Web Speech API (webkitSpeechRecognition)
- Continuous recognition with interim results
- Auto-appends transcribed text to input
- Error handling and browser compatibility check

#### 2. **useChatStorage** (`hooks/useChatStorage.js`)
Manages localStorage persistence:
```javascript
useChatStorage(chats, setChats, activeChatId, setActiveChatId, CHAT_RETENTION_MS);
```
- Loads chats from localStorage on mount
- Saves chats to localStorage on change
- Auto-cleans expired chats (24-hour retention)
- Handles active chat ID persistence

### State Management

```javascript
// Chat State
const [chats, setChats] = useState([]);           // Array of chat objects
const [activeChatId, setActiveChatId] = useState(null);  // Current chat ID

// Each chat object:
{
  id: string,                    // Unique chat ID
  topic: string,                 // Chat topic/name
  messages: [],                  // Message history
  quizState: null | {...},       // Quiz state (if active)
  quizTopic: string,             // Topic for quiz
  showQuizSetup: boolean,        // Show quiz setup UI
  createdAt: number,             // Timestamp for cleanup
  lastActivity: number           // Last interaction time
}

// UI State
const [input, setInput] = useState("");           // Textarea input
const [age, setAge] = useState(10);               // Age level
const [isStreaming, setIsStreaming] = useState(false);  // Streaming indicator
const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);  // Quiz generation

// Quiz Configuration
const [quizDifficulty, setQuizDifficulty] = useState("medium");

// Topic Packs
const [packs, setPacks] = useState({});           // Loaded from backend
const [selectedPack, setSelectedPack] = useState("");  // Selected pack

// Custom Hooks
const { isListening, toggleListening } = useSpeechRecognition(setInput);
useChatStorage(chats, setChats, activeChatId, setActiveChatId, CHAT_RETENTION_MS);
```

### API Integration

All API calls use the environment variable `import.meta.env.VITE_API_URL`:

#### 1. **Fetch Topic Packs**
```javascript
fetch(`${import.meta.env.VITE_API_URL}/topics`)
```

#### 2. **Stream Explanation** (Server-Sent Events)
```javascript
const res = await fetch(`${import.meta.env.VITE_API_URL}/explain/stream`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text, age, context })
});
const reader = res.body.getReader();
// Process streaming chunks...
```

#### 3. **Generate Quiz**
```javascript
const res = await fetch(`${import.meta.env.VITE_API_URL}/quiz/generate`, {
  method: "POST",
  body: JSON.stringify({ topic, age, num_questions: 5, difficulty })
});
```

#### 4. **Audio Playback**
```javascript
src={`${import.meta.env.VITE_API_URL}${m.audio_url}`}
```
- age: Selected age level (5-35)

// Mode and quiz state
- mode: "explain" or "quiz"
- quizState: { topic, questions, currentIndex, score, answers, showingFeedback, completed }
- quizDifficulty: "easy", "medium", or "hard"
- showQuizSetup: Boolean for setup UI visibility
- quizTopic: Topic for quiz generation
- isGeneratingQuiz: Loading state for quiz generation

// UI state
- packs: Available topic packs from API
- selectedPack: Currently selected topic pack
- isListening: Voice input recording state
```

### Layout

The application uses a three-column grid layout:

1. **Left Sidebar (286px)**
   - Mode toggle buttons (Explain / Quiz)
   - "Start New Chat" button
   - Chat list with active highlighting
   - Chat history list with text ellipsis
   - Click to switch between chats
   - Active chat highlighted

2. **Center Chat Area (flexible)**
   - Message display with auto-scroll
   - Streaming AI responses with live cursor
   - Color-coded sections:
     - Green: Explanation
     - Yellow: Example
     - Blue: Question
     - Purple: Feedback
     - Orange: Audio
   - Auto-growing textarea input
   - Microphone and send buttons

3. **Right Sidebar (330px)**
   - Age slider (5-35 years)
   - Topic pack selector
   - Quick topic buttons

## Features

### Real-Time Streaming

**How It Works:**
- Uses Server-Sent Events (SSE) to receive AI responses
- Text appears character-by-character as AI generates it
- Blinking cursor (▋) shows where content is being added
- No waiting for full response before seeing results

**Benefits:**
- Immediate engagement
- Feels more interactive and responsive
- Can start reading before AI finishes

### Voice Input

**How to Use:**
1. Click the microphone button (🎤)
2. Speak your question or answer
3. Button turns red and pulses while listening
4. Click again to stop, or just press Enter/Send
5. Text appears in input box automatically
6. Review/edit if needed before sending

**Browser Support:**
- Chrome, Edge, Safari (Web Speech API required)
- Graceful fallback message if unsupported

### Chat Management

**Start New Chat**
- Click "+ Start New Chat" button
- Creates a fresh chat session
- Previous chats are preserved in localStorage

**Chat Persistence**
- All chats saved to browser localStorage
- 24-hour retention policy (configurable)
- Automatic cleanup of expired chats
- Chat state restored on page reload

**Switch Between Chats**
- Click any chat in the history
- View full conversation
- Continue from where you left off

### Intelligent Conversation

**Intent Inference with LangGraph:**
- LangGraph workflow automatically detects user intent
- LLM-powered intent classification determines:
  - **Question Intent** → Provides explanation → example → safety check → follow-up question
  - **Answer Intent** → Evaluates response → provides feedback
- Conditional routing based on conversation context
- Full conversation history maintained for context-aware responses

**Answer Evaluation:**
- When you answer an AI's question, it provides encouraging feedback
- Acknowledges correct understanding
- Gently corrects misconceptions
- Builds on your knowledge

### Quiz Mode

**Quiz Setup:**
1. Click "Quiz" mode button in left sidebar
2. Enter a topic or click "Use Current Topic" (if chatting)
3. Select difficulty: Easy, Medium, or Hard (slider)
4. Adjust age level (5-35 years)
5. Click "Generate Quiz (5 questions)"
6. Loading spinner shows progress during generation

**Taking the Quiz:**
- Multiple choice questions (4 options)
- Click an option to submit answer
- Immediate feedback with checkmark (correct) or X (incorrect)
- Explanation provided for each answer
- Score tracked throughout quiz
- Click "Next" to continue after viewing feedback

**Completion:**
- Final score displayed at end
- Option to start new quiz
- Quiz state persisted in localStorage

### Message Display

**For Topic Explanations:**
1. **Explanation** (green border): Core concept
2. **Example** (yellow border): Relatable scenario
3. **Question** (blue border): Thought-provoking follow-up

**For Answer Feedback:**
1. **Feedback** (purple border): Encouraging evaluation of your answer

### Audio Playback

- Auto-generated audio for each response
- Wrapped in styled container with orange border
- Only one audio plays at a time
- Automatic pause of other players when starting new audio

### Age Level Control

- Slider from 5 to 35 years
- Adjusts complexity of explanations
- Live indicator shows current age
- Affects both question difficulty and answer feedback

### Topic Packs

Pre-organized topics by category:
- Science
- Technology
- History
- Nature
- etc.

Click a topic button to auto-fill the input field.

## Styling

### Color Scheme

- **Primary Blue**: `#2563eb` (buttons, send icon, questions)
- **Green**: `#10b981` (explanations)
- **Yellow**: `#fbbf24` (examples)
- **Purple**: `#8b5cf6` (feedback)
- **Orange**: `#f97316` (audio)
- **Red**: `#ef4444` (recording indicator)
- **Background**: `#f9fafb` (sidebars), `#ffffff` (main)
- **Borders**: `#e5e7eb`
- **Text**: `#111827` (primary), `#6b7280` (secondary)

### Section Styling

All assistant sections share:
- Left border (3px, color-coded)
- Light gray background (`#f3f4f6`)
- Rounded corners (6px)
- Padding and margins for spacing
- Text wrapping for long content

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700
- **Line Height**: 1.5-1.6 for readability
- **Fallbacks**: System sans-serif fonts

### Key CSS Classes

```css
.app                       # Main grid container
.sidebar                   # Left/right sidebars
.chat                      # Center chat container
.messages                  # Scrollable message area
.input-box                 # Fixed input area with textarea
.textarea-container        # Relative container for buttons
.mic-button                # Voice input button
.mic-button.listening      # Active recording state
.send-icon                 # Send button
.chat-item                 # Chat history items with ellipsis
.new-chat-btn              # New chat button
.assistant-section         # Base AI response section
.assistant-section.explanation  # Green border
.assistant-section.example      # Yellow border
.assistant-section.question     # Blue border
.assistant-section.feedback     # Purple border
.assistant-section.audio        # Orange border
.cursor                    # Blinking streaming cursor
.msg.user                  # User messages with gray background
```

## API Integration

### Endpoints Used

**POST /explain/stream** (Primary)
```javascript
const res = await fetch("http://localhost:8000/explain/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    topic: text, 
    age,
    context: conversationHistory  // Full chat context
  })
});

// Server-Sent Events streaming
const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // Parse SSE data and update UI in real-time
}
```

**GET /topics**
```javascript
fetch("http://localhost:8000/topics")
```

**GET /audio/{file_name}**
```html
<audio src="http://localhost:8000/audio/file.mp3" />
```

## User Workflows

### Starting a New Conversation

1. Click "+ Start New Chat" or type directly
2. Enter a topic or select from topic packs
3. **OR** Click microphone button and speak your question
4. Adjust age level if needed
5. Press Enter or click "Send"
6. Watch explanation stream in real-time
7. View example and question as they appear
8. Listen to audio narration (optional)

### Answering AI Questions

1. After receiving a question from AI
2. Type your answer (or use voice input)
3. Press Enter or click "Send"
4. AI automatically detects it's an answer
5. Receive encouraging feedback in real-time

### Continuing a Conversation

1. Type follow-up question (related or new topic)
2. AI maintains context from previous messages
3. Receive contextually-aware explanation
4. Conversation flows naturally
2. Press Enter or click "Send"
3. New response appended to chat
4. Auto-scrolls to latest message

### Managing Multiple Chats

1. Start new topics as separate chats
2. Switch between chats via left sidebar
3. Each chat maintains its own history
4. Active chat highlighted in sidebar

## Customization

### Changing Theme Colors

Edit `index.css`:
```css
.new-chat-btn {
  background: #your-color;
}
```

### Adjusting Layout Widths

Edit `index.css`:
```css
.app {
  grid-template-columns: 286px 1fr 330px;
}
```

### Modifying Age Range

Edit `App.jsx`:
```jsx
<input
  type="range"
  min="5"
  max="35"
  value={age}
/>
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Considerations

- Auto-scroll uses smooth behavior
- Audio elements lazy-load
- Chat history virtualization recommended for 100+ chats
- Messages auto-scroll with smooth animation

## Troubleshooting

### Backend Connection Failed
- Verify backend is running on port 8000
- Check CORS configuration
- Inspect browser console for errors

### Audio Not Playing
- Check audio URL in network tab
- Verify backend audio endpoint
- Check browser audio permissions

### Layout Issues
- Clear browser cache
- Check CSS imports
- Verify Vite dev server is running

## Future Enhancements

- [ ] Local storage for chat persistence
- [ ] Export chat history
- [ ] Markdown rendering in responses
- [ ] Custom topic packs
- [ ] Dark mode support
- [ ] Mobile responsive design
- [ ] Keyboard shortcuts

## License

MIT

