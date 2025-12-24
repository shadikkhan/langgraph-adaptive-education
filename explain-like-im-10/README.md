# Explain Like I'm 10 - Frontend

A modern React application that provides age-appropriate explanations for various topics using AI with real-time streaming, intent inference, and interactive quiz mode.

## Features

### 🎯 Dual Modes
- **Explain Mode**: Ask questions and get AI-generated explanations with examples
- **Quiz Mode**: Interactive multiple-choice quizzes with instant feedback

### 🧠 Intelligent Features
- **Intent Inference**: AI automatically detects if you're asking a question or answering one
- **Context-Aware**: Maintains conversation history for coherent multi-turn dialogues
- **Age-Appropriate**: Customize explanations based on age level (5-35 years)
- **Answer Evaluation**: AI provides encouraging feedback when you answer questions

### ⚡ Real-Time Experience
- **Streaming Responses**: AI responses appear live as they're generated
- **Loading States**: Visual feedback with spinners during generation
- **Typing Animation**: Cursor effect during streaming

### 🎮 Quiz Mode Features
- **Setup Screen**: Configure topic, difficulty, and age before starting
- **Difficulty Levels**: Visual slider for Easy, Medium, or Hard
- **Multiple Choice**: 4 options per question with visual feedback
- **Instant Feedback**: Green (correct) or red (incorrect) indicators
- **Score Tracking**: Real-time score and progress display
- **Comprehensive Review**: See all answers and explanations at the end
- **Retry Option**: Generate new quiz with adjusted settings

### 💬 Chat Features
- **Multi-Chat Support**: Manage multiple conversation threads
- **Chat Persistence**: Conversations saved locally for 24 hours
- **Auto-Scroll**: Seamless navigation to latest messages
- **Chat History**: Access previous conversations

### 🎤 Input Methods
- **Voice Input**: Speech-to-text using Web Speech API
- **Text Input**: Multi-line textarea with auto-resize
- **Quick Topics**: Pre-defined topic packs for quick start

### 🔊 Media Features
- **Audio Playback**: Text-to-speech narration of explanations
- **Single-Play**: Automatic pause of other audio when playing
- **Audio Controls**: Standard playback controls

### 🎨 User Interface
- **Three-Column Layout**: Left sidebar (chats/mode), center (content), right sidebar (settings)
- **Responsive Design**: Adapts to different screen sizes
- **Color-Coded Sections**: Visual distinction for Explanation, Example, Question, Feedback
- **Modern Styling**: Clean, professional design with Inter font

## Tech Stack

- **React 18**: UI framework with hooks
- **Vite**: Build tool and dev server
- **Server-Sent Events (SSE)**: Real-time streaming from backend
- **Web Speech API**: Voice-to-text input
- **LocalStorage API**: Chat persistence
- **CSS3**: Custom styling with flexbox/grid layouts
- **Inter Font**: Professional typography

## Project Structure

```
explain-like-im-10/
├── public/              # Static assets
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # App-specific styles
│   ├── index.css        # Global styles and layout
│   ├── main.jsx         # Application entry point
│   └── assets/          # Images and other assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## Setup

### Prerequisites

- **Node.js 16+** and npm
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure backend is running (see backend README)

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

## Application Structure

### Main Components

#### App Component (`App.jsx`)
The main application component manages:
- **Dual Modes**: Toggle between Explain and Quiz modes
- **Quiz State**: Setup, generation, and completion flow
- **Real-time Streaming**: SSE responses from backend with intent inference
- **Chat State**: localStorage persistence with 24-hour retention
- **Voice Input**: Web Speech API integration
- **Active Chat**: Selection and switching between conversations
- **Age Level**: Configuration for content adaptation
- **Topic Packs**: Integration with pre-defined topics
- **Audio Playback**: Synchronization across messages
- **Conversation Context**: Full history for intelligent routing

#### State Management
```javascript
// Core state
- chats: Array of chat objects with messages (persisted to localStorage)
- activeChatId: Currently selected chat ID
- input: User input text
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

