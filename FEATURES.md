# New Features Implementation Guide

## Overview
This application now includes three major features:
1. **Intent Inference with LangGraph** - Automatically detects whether users are asking questions or answering
2. **Streaming Responses** - Real-time streaming of explanations
3. **Quiz Mode** - Interactive quiz generation and evaluation

---

## 1. Intent Inference with LangGraph

### How It Works
The LangGraph workflow now starts with an **intent inference node** that analyzes user input and conversation context to determine:

- **new_question**: User is asking about a new topic
- **answer**: User is answering a previous question
- **followup**: User is asking a follow-up question

### Workflow Graph
```
┌─────────────────┐
│  Infer Intent   │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Route?  │
    └─┬────┬──┘
      │    │
      │    └─► Simplify ─► Example ─► Safety ─► Question ─► Format ─► END
      │
      └─► Evaluate Answer ─► Format ─► END
```

### Backend Changes

**models.py**:
- Added `intent` field to `ExplainState`
- Added `feedback` field for answer evaluation
- Added `QuizRequest` and `QuizAnswerRequest` models

**graph.py**:
- Added `infer_intent()` node - uses LLM to classify user intent
- Added `evaluate_answer()` node - provides feedback on user answers
- Added `route_by_intent()` - conditional edge routing based on intent
- Updated `format_out()` - returns different output based on intent
- Updated streaming function to emit intent information

### Usage
The intent inference happens automatically. When a user submits input:
1. System analyzes conversation history
2. Determines if it's a question or answer
3. Routes to appropriate workflow path
4. Streams appropriate response

---

## 2. Streaming Responses

### How It Works
Responses are streamed in real-time using Server-Sent Events (SSE):

### Stream Event Types
- `intent` - Inferred user intent
- `section` - New section starting (Explanation, Example, Question, Feedback)
- `content` - Incremental text content
- `update` - Replace section content
- `audio` - Audio URL when ready
- `done` - Stream complete

### Backend Implementation

**routes.py** - `/explain/stream` endpoint:
```python
async def explain_stream(req: ExplainRequest):
    async def event_generator():
        async for chunk in stream_explain_graph(req.topic, req.age, req.context):
            yield f"data: {json.dumps(chunk)}\n\n"
```

**graph.py** - `stream_explain_graph()`:
- Streams LLM responses using `llm.astream()`
- Yields chunks as JSON objects
- Generates audio after streaming completes

### Frontend Implementation

**App.jsx**:
- Uses `ReadableStream` to consume SSE
- Updates UI in real-time as chunks arrive
- Shows typing cursor animation
- Accumulates text for audio generation

---

## 3. Quiz Mode

### Features
- Generate multiple-choice quizzes on any topic
- Age-appropriate questions
- Difficulty levels: easy, medium, hard (slider-based selection)
- Quiz setup screen with topic customization
- Option to use current chat topic or enter new one
- Loading states with spinner during quiz generation
- Instant feedback with explanations
- Manual progression with Next button
- Score tracking and completion summary
- Persistent quiz state in localStorage

### User Flow

#### Setup
1. Click **Quiz** mode button in left sidebar
2. Quiz setup screen appears with:
   - Topic input field (or "Use Current Topic" button if chatting)
   - Difficulty slider: Easy ← → Medium ← → Hard
   - Age level slider (5-35 years)
   - "Generate Quiz (5 questions)" button
3. Click generate button
4. Loading spinner appears while quiz is being created
5. Quiz interface loads with first question

#### Taking Quiz
1. Read question (e.g., "Question 1 of 5")
2. View 4 multiple-choice options (A, B, C, D)
3. Click an option to submit answer
4. Immediate visual feedback:
   - ✓ for correct (green highlight)
   - ✗ for incorrect (red highlight)
5. Read explanation and feedback
6. Current score displayed (e.g., "Score: 3/5")
7. Click **Next** button to proceed to next question

#### Completion
- Final score displayed
- "Quiz Complete!" message
- Option to return to setup and create new quiz

### Backend Endpoints

#### Generate Quiz
**POST** `/quiz/generate`
```json
{
  "topic": "photosynthesis",
  "age": 12,
  "num_questions": 5,
  "difficulty": "medium"
}
```

**Response**:
```json
{
  "questions": [
    {
      "question": "What do plants need for photosynthesis?",
      "options": {
        "A": "Water and sunlight",
        "B": "Only water",
        "C": "Only sunlight",
        "D": "Soil only"
      },
      "correct": "A",
      "explanation": "Plants need both water and sunlight, along with carbon dioxide, to make food through photosynthesis."
    }
  ],
  "topic": "photosynthesis"
}
```

#### Evaluate Answer
**POST** `/quiz/evaluate`
```json
{
  "question": "What is 2+2?",
  "correct_answer": "A",
  "user_answer": "A",
  "age": 10
}
```

**Response**:
```json
{
  "is_correct": true,
  "feedback": "Great job! You got it right!",
  "explanation": ""
}
```

### Frontend UI

**Mode Toggle**: Switch between Explain and Quiz modes using sidebar buttons

**Quiz Setup Screen** (`showQuizSetup` state):
```jsx
- Topic input with "Use Current Topic" option
- Difficulty slider with visual labels
- Age adjustment (inherited from global setting)
- Generate button with loading spinner
- Disabled state during quiz generation
```

**Quiz Interface** (`quizState` active):
```jsx
- Question number indicator (Question X of 5)
- Current score display (Score: X/5)
- Question text
- Four clickable option buttons (A, B, C, D)
- Visual feedback on selection:
  - Correct: Green background with ✓
  - Incorrect: Red background with ✗
- Explanation text after selection
- Next button (appears after selection, disabled during feedback)
- Quiz completion screen with final score
```

### Quiz State Management
```javascript
// Main quiz state object
quizState = {
  topic: string,           // Quiz topic
  questions: Array,        // Array of question objects
  currentIndex: number,    // Current question (0-based)
  score: number,          // Number of correct answers
  answers: Array,         // User's answer history
  completed: boolean,     // Quiz completion flag
  showingFeedback: boolean // Show explanation state
}

// Additional state variables
quizDifficulty: "easy" | "medium" | "hard"  // Selected difficulty
showQuizSetup: boolean                       // Show/hide setup screen
isGeneratingQuiz: boolean                    // Loading state
quizTopic: string                           // Topic for generation
```

---

## Technical Implementation Details

### LangGraph Workflow
Uses LangGraph's `StateGraph` (v0.2.45) with:
- **Conditional edges** for intent-based routing
- **TypedDict state management** with ExplainState model
- **Multiple node types**:
  - `infer_intent`: LLM-powered intent classification
  - `simplify`: Generate age-appropriate explanation
  - `example`: Create relatable example
  - `safety`: Safety check for content
  - `question`: Generate follow-up question
  - `evaluate_answer`: Provide feedback on user answers
  - `format_out`: Format final output based on intent
- **State fields**: messages, user_input, age, explanation, example, question, intent, feedback

### Intent Inference Logic
```python
# Analyzes conversation history and user input
def infer_intent(state: ExplainState):
    if len(state["messages"]) < 2:
        return {"intent": "new_question"}
    
    # Use LLM to classify intent
    prompt = f"User: {user_input}\nLast AI: {last_ai}"
    response = llm.invoke(prompt)
    # Returns: "answer" or "new_question"
```

### Conditional Routing
```python
def route_by_intent(state: ExplainState):
    intent = state.get("intent", "new_question")
    if intent == "answer":
        return "evaluate"
    return "simplify"
```

### Streaming Architecture
- **Backend**: FastAPI with `StreamingResponse` (SSE format)
- **Format**: `text/event-stream` with JSON payloads
- **Events**: `intent`, `section`, `content`, `update`, `audio`, `done`
- **Frontend**: fetch API with ReadableStream reader
- **Real-time Updates**: Character-by-character text streaming with typing cursor

### State Management
- **React Hooks**: useState for component state
- **localStorage**: 24-hour chat persistence with auto-cleanup
- **Conversation History**: Full message array sent with each request
- **Intent-Aware Routing**: Backend determines workflow path based on LLM analysis
- **Quiz State**: Separate state object for quiz progression and scoring

---

## How to Use

### 1. Start Backend
```bash
cd backend
# Ensure Ollama is running with llama3.1:8b model
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend
```bash
cd explain-like-im-10
npm install  # First time only
npm run dev
```

### 3. Use Features

**Explain Mode** (Default):
1. Type a question in the input box (or use microphone)
2. System automatically infers intent:
   - New question → Full explanation workflow
   - Answer to AI's question → Feedback and evaluation
3. Watch as response streams in real-time
4. Sections appear with color coding:
   - 🟢 Explanation
   - 🟡 Example
   - 🔵 Question
   - 🟣 Feedback
5. Click speaker icon to hear audio
6. Answer AI's follow-up question to continue learning

**Quiz Mode**:
1. Click "🎯 Quiz" button in left sidebar
2. Quiz setup screen appears:
   - Enter topic or click "Use Current Topic"
   - Drag difficulty slider (Easy/Medium/Hard)
   - Adjust age if needed
3. Click "Generate Quiz (5 questions)"
4. Wait for loading spinner (quiz generation)
5. Answer each question by clicking an option
6. View feedback and explanation
7. Click "Next" to continue
8. Review final score at completion

---

## Code Examples

### Triggering Intent Inference
```javascript
// Frontend sends conversation context
const requestBody = { 
  topic: userInput, 
  age: selectedAge,
  context: conversationHistory  // Full chat history
};

// Backend workflow (graph.py)
async def stream_explain_graph(topic, age, context):
    # Initialize state with conversation history
    state = {"messages": context, "user_input": topic, "age": age}
    
    # LangGraph executes workflow
    # 1. Infer intent from context
    intent_result = await infer_intent(state)
    
    # 2. Route based on intent
    next_node = route_by_intent(intent_result)
    
    # 3. Execute appropriate path
    if next_node == "evaluate":
        yield {"type": "intent", "value": "answer"}
        # Evaluate user's answer
    else:
        yield {"type": "intent", "value": "new_question"}
        # Generate explanation → example → question
```

### Streaming Consumption (Frontend)
```javascript
const sendMessage = async () => {
  const res = await fetch('/explain/stream', {
    method: 'POST',
    body: JSON.stringify({ topic, age, context })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        
        // Handle different event types
        if (data.type === 'section') {
          setCurrentSection(data.section);
        } else if (data.type === 'content') {
          accumulateText(data.content);
        } else if (data.type === 'done') {
          finalizMessage();
        }
      }
    }
  }
};
```

### Quiz Generation and Evaluation
```javascript
// Generate quiz
const startQuiz = async () => {
  setIsGeneratingQuiz(true);
  
  const res = await fetch('/quiz/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: quizTopic,
      age: age,
      num_questions: 5,
      difficulty: quizDifficulty
    })
  });
  
  const data = await res.json();
  setQuizState({
    topic: data.topic,
    questions: data.questions,
    currentIndex: 0,
    score: 0,
    answers: [],
    showingFeedback: false,
    completed: false
  });
  
  setIsGeneratingQuiz(false);
  setShowQuizSetup(false);
};

// Submit quiz answer
const submitQuizAnswer = async (selectedOption) => {
  const currentQuestion = quizState.questions[quizState.currentIndex];
  const isCorrect = selectedOption === currentQuestion.correct;
  
  // Update state with answer
  setQuizState({
    ...quizState,
    score: isCorrect ? quizState.score + 1 : quizState.score,
    answers: [...quizState.answers, {
      question: currentQuestion.question,
      userAnswer: selectedOption,
      correct: currentQuestion.correct,
      isCorrect
    }],
    showingFeedback: true
  });
};

// Progress to next question
const nextQuestion = () => {
  if (quizState.currentIndex === quizState.questions.length - 1) {
    // Quiz complete
    setQuizState({ ...quizState, completed: true });
  } else {
    // Next question
    setQuizState({
      ...quizState,
      currentIndex: quizState.currentIndex + 1,
      showingFeedback: false
    });
  }
};
```

### LangGraph Node Implementation
```python
# Intent inference node
def infer_intent(state: ExplainState):
    messages = state["messages"]
    user_input = state["user_input"]
    
    if len(messages) < 2:
        return {"intent": "new_question"}
    
    last_ai_message = messages[-1]
    
    prompt = f"""Based on conversation:
    AI: {last_ai_message}
    User: {user_input}
    
    Is the user answering a question or asking something new?
    Respond with only: "answer" or "new_question"
    """
    
    response = llm.invoke(prompt)
    intent = response.content.strip().lower()
    
    return {"intent": intent}

# Conditional routing function
def route_by_intent(state: ExplainState):
    intent = state.get("intent", "new_question")
    if intent == "answer":
        return "evaluate"
    return "simplify"

# Answer evaluation node
def evaluate_answer(state: ExplainState):
    user_input = state["user_input"]
    messages = state["messages"]
    age = state["age"]
    
    prompt = f"""Age {age} child answered: {user_input}
    Previous question: {messages[-1]}
    
    Provide encouraging feedback."""
    
    response = llm.invoke(prompt)
    return {"feedback": response.content}
```

---

## Benefits

1. **Better User Experience**: Intent inference provides contextual responses
2. **Real-time Feedback**: Streaming makes the app feel faster and more responsive
3. **Educational Value**: Quiz mode adds interactive learning
4. **Scalability**: LangGraph makes workflow extensible
5. **Age-Appropriate**: All features respect age settings

---

## Future Enhancements

- [ ] Multi-turn quiz conversations
- [ ] Adaptive difficulty based on performance
- [ ] Voice input for quiz answers
- [ ] Leaderboards and achievements
- [ ] Topic-specific quiz packs
- [ ] Export quiz results
- [ ] Collaborative quiz mode
