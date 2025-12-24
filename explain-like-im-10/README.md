# Explain Like I'm 10 - Frontend

A modern React application that provides age-appropriate explanations for various topics using AI. The interface allows users to ask questions and receive explanations tailored to different age levels (5-35 years).

## Features

- 🎯 **Age-Appropriate Explanations**: Customize explanations based on age level
- 💬 **Chat Interface**: Multi-chat support with chat history
- 🔊 **Audio Playback**: Listen to explanations with text-to-speech
- 📚 **Topic Packs**: Pre-defined topics organized by category
- 🎨 **Modern UI**: Clean, responsive design with Inter font

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **CSS3**: Custom styling with flexbox/grid layouts
- **Google Fonts**: Inter font family

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
- Chat state and history
- Active chat selection
- Age level configuration
- Topic pack integration
- Audio playback synchronization

#### State Management
```javascript
- chats: Array of chat objects with messages
- activeChatId: Currently selected chat ID
- input: User input text
- age: Selected age level (5-35)
- packs: Available topic packs from API
- selectedPack: Currently selected topic pack
```

### Layout

The application uses a three-column grid layout:

1. **Left Sidebar (286px)**
   - "Start New Chat" button
   - Chat history list
   - Click to switch between chats

2. **Center Chat Area (flexible)**
   - Message display with auto-scroll
   - Explanation, Example, and Question sections
   - Audio player for each response
   - Fixed input box at bottom

3. **Right Sidebar (330px)**
   - Age slider (5-35 years)
   - Topic pack selector
   - Quick topic buttons

## Features

### Chat Management

**Start New Chat**
- Click "+ Start New Chat" button
- Creates a fresh chat session
- Previous chats are preserved

**Switch Between Chats**
- Click any chat in the history
- View full conversation
- Continue from where you left off

### Message Display

Each AI response contains three sections:

1. **Explanation**: Core concept explanation
2. **Example**: Relatable example scenario
3. **Question**: Thought-provoking follow-up question

### Audio Playback

- Auto-generated audio for each response
- Only one audio plays at a time
- Automatic pause of other players when starting new audio

### Age Level Control

- Slider from 5 to 35 years
- Adjusts complexity of explanations
- Live indicator shows current age

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

- **Primary Blue**: `#2563eb` (buttons, accents)
- **Background**: `#f9fafb` (sidebars), `#ffffff` (main)
- **Borders**: `#e5e7eb`
- **Text**: `#111827` (primary), `#6b7280` (secondary)
- **Hover**: `#f3f4f6`, `#1d4ed8`

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700
- **Fallbacks**: System sans-serif fonts

### Key CSS Classes

```css
.app                    # Main grid container
.sidebar               # Left/right sidebars
.chat                  # Center chat container
.messages              # Scrollable message area
.input-box             # Fixed input area
.chat-item             # Chat history items
.new-chat-btn          # New chat button
.assistant-section     # AI response sections
```

## API Integration

### Endpoints Used

**POST /explain**
```javascript
fetch("http://localhost:8000/explain", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ topic: text, age })
})
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
3. Adjust age level if needed
4. Press Enter or click "Send"
5. View explanation with example and question
6. Listen to audio narration (optional)

### Continuing a Conversation

1. Type follow-up question
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

