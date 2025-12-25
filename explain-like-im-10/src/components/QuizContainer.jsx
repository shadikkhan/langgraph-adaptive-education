export default function QuizContainer({ activeChat, activeChatId, setChats, submitQuizAnswer, nextQuestion }) {
  const { quizState } = activeChat;

  if (!quizState) return null;

  if (quizState.completed) {
    return (
      <div className="quiz-results">
        <h2>Quiz Complete! 🎉</h2>
        <div className="final-score" style={{ fontSize: "2em", margin: "24px 0" }}>
          Score: {quizState.score}/{quizState.questions.length}
          <div style={{ fontSize: "0.5em", marginTop: "8px" }}>
            {Math.round((quizState.score / quizState.questions.length) * 100)}%
          </div>
        </div>
        
        <h3>Review:</h3>
        {quizState.answers.map((answer, i) => (
          <div key={i} className="review-item" style={{
            padding: "16px",
            margin: "12px 0",
            border: `2px solid ${answer.isCorrect ? '#28a745' : '#dc3545'}`,
            borderRadius: "8px"
          }}>
            <p><strong>Q{i + 1}:</strong> {answer.question}</p>
            <p>Your answer: <strong>{answer.userAnswer}</strong> {answer.isCorrect ? "✓" : "✗"}</p>
            {!answer.isCorrect && <p>Correct answer: <strong>{answer.correctAnswer}</strong></p>}
            <p style={{ fontSize: "0.9em", color: "#666" }}>{answer.explanation}</p>
          </div>
        ))}
        
        <button 
          onClick={() => {
            setChats(prev =>
              prev.map(c =>
                c.id === activeChatId
                  ? { ...c, quizTopic: quizState.topic, showQuizSetup: true, quizState: null }
                  : c
              )
            );
          }}
          style={{
            padding: "12px 24px",
            marginTop: "16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Try Again
        </button>
        <button 
          onClick={() => {
            setChats(prev =>
              prev.map(c =>
                c.id === activeChatId
                  ? { ...c, quizState: null, showQuizSetup: false }
                  : c
              )
            );
          }}
          style={{
            padding: "12px 24px",
            marginTop: "16px",
            marginLeft: "12px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Back to Explain
        </button>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentIndex];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Quiz: {quizState.topic}</h2>
        <div className="quiz-progress">
          Question {quizState.currentIndex + 1} of {quizState.questions.length}
          <span style={{ marginLeft: "16px" }}>Score: {quizState.score}/{quizState.currentIndex}</span>
        </div>
      </div>
      
      <div className="quiz-question">
        <h3>{currentQuestion.question}</h3>
        
        <div className="quiz-options">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => submitQuizAnswer(key)}
              disabled={quizState.showingFeedback}
              className={`quiz-option ${
                quizState.showingFeedback && key === currentQuestion.correct
                  ? 'correct'
                  : quizState.showingFeedback && key === quizState.answers[quizState.answers.length - 1]?.userAnswer
                  ? 'incorrect'
                  : ''
              }`}
              style={{
                padding: "16px",
                margin: "8px 0",
                border: "2px solid #ddd",
                borderRadius: "8px",
                background: "white",
                cursor: quizState.showingFeedback ? "not-allowed" : "pointer",
                textAlign: "left",
                width: "100%"
              }}
            >
              <strong>{key}.</strong> {value}
            </button>
          ))}
        </div>
        
        {quizState.showingFeedback && (
          <>
            <div className={`quiz-feedback ${quizState.currentIsCorrect ? 'correct' : 'incorrect'}`}
                 style={{
                   marginTop: "16px",
                   padding: "16px",
                   borderRadius: "8px",
                   background: quizState.currentIsCorrect ? "#d4edda" : "#f8d7da",
                   color: quizState.currentIsCorrect ? "#155724" : "#721c24"
                 }}>
              <strong>{quizState.currentIsCorrect ? "✓ Correct!" : "✗ Not quite!"}</strong>
              <p>{currentQuestion.explanation}</p>
            </div>
            <button
              onClick={nextQuestion}
              style={{
                marginTop: "16px",
                padding: "12px 24px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600"
              }}
            >
              {quizState.currentIndex < quizState.questions.length - 1 ? "Next Question →" : "View Results"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
