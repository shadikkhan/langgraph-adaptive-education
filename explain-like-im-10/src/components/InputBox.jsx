export default function InputBox({ 
  input, 
  setInput, 
  send, 
  isListening, 
  toggleListening, 
  textareaRef,
  activeChat,
  showQuizSetupUI
}) {
  return (
    <div className="input-box">
      <div className="textarea-container">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question or answer the previous one..."
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
        />
        {activeChat && activeChat.messages && activeChat.messages.length > 0 && !activeChat.quizState && !activeChat.showQuizSetup && (
          <button 
            className="quiz-button"
            onClick={showQuizSetupUI}
            title="Start Quiz on this topic"
          >
            🎯
          </button>
        )}
        <button 
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          title={isListening ? "Stop recording" : "Start voice input"}
        >
          {isListening ? '⏹' : '🎤'}
        </button>
        <button className="send-icon" onClick={send} title="Send message">
          ➤
        </button>
      </div>
    </div>
  );
}
