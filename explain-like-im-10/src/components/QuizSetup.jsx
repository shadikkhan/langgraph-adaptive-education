export default function QuizSetup({ 
  activeChat, 
  activeChatId, 
  quizDifficulty, 
  setQuizDifficulty, 
  age, 
  setAge, 
  isGeneratingQuiz, 
  setChats, 
  startQuiz 
}) {
  return (
    <div className="quiz-setup-container" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      padding: "40px"
    }}>
      <div style={{
        maxWidth: "500px",
        width: "100%",
        background: "white",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ marginBottom: "24px", textAlign: "center" }}>🎯 Quiz Setup</h2>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            Quiz Topic
          </label>
          <input
            type="text"
            value={activeChat?.quizTopic || ""}
            onChange={(e) => setChats(prev =>
              prev.map(c =>
                c.id === activeChatId
                  ? { ...c, quizTopic: e.target.value }
                  : c
              )
            )}
            placeholder="Enter a topic (e.g., photosynthesis, planets, fractions)"
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "16px"
            }}
          />
          {activeChat && (
            <p style={{ 
              marginTop: "8px", 
              fontSize: "14px", 
              color: "#6b7280" 
            }}>
              💡 Current chat topic: {activeChat.topic}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>
            Difficulty Level
          </label>
          <input
            type="range"
            min="0"
            max="2"
            value={quizDifficulty === "easy" ? 0 : quizDifficulty === "medium" ? 1 : 2}
            onChange={e => {
              const value = Number(e.target.value);
              setQuizDifficulty(value === 0 ? "easy" : value === 1 ? "medium" : "hard");
            }}
            style={{ width: "100%" }}
          />
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            fontSize: "12px",
            marginTop: "8px",
            color: "#6b7280"
          }}>
            <span>Easy</span>
            <span>Medium</span>
            <span>Hard</span>
          </div>
          <div style={{
            textAlign: "center",
            marginTop: "12px",
            padding: "12px",
            background: quizDifficulty === "easy" ? "#d1fae5" : quizDifficulty === "medium" ? "#fef3c7" : "#fecaca",
            borderRadius: "8px",
            fontWeight: "600",
            textTransform: "capitalize",
            color: quizDifficulty === "easy" ? "#065f46" : quizDifficulty === "medium" ? "#92400e" : "#991b1b"
          }}>
            {quizDifficulty}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            Age Level: {age}
          </label>
          <input
            type="range"
            min="5"
            max="35"
            value={age}
            onChange={e => setAge(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => {
              setChats(prev =>
                prev.map(c =>
                  c.id === activeChatId
                    ? { ...c, showQuizSetup: false }
                    : c
                )
              );
            }}
            disabled={isGeneratingQuiz}
            style={{
              flex: 1,
              padding: "12px 24px",
              background: isGeneratingQuiz ? "#9ca3af" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isGeneratingQuiz ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600"
            }}
          >
            Cancel
          </button>
          <button
            onClick={startQuiz}
            disabled={!(activeChat?.quizTopic?.trim()) || isGeneratingQuiz}
            style={{
              flex: 2,
              padding: "12px 24px",
              background: isGeneratingQuiz ? "#3b82f6" : (activeChat?.quizTopic?.trim() ? "#007bff" : "#cbd5e0"),
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: (!(activeChat?.quizTopic?.trim()) || isGeneratingQuiz) ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {isGeneratingQuiz ? (
              <>
                <span className="spinner" style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #ffffff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></span>
                Generating Quiz...
              </>
            ) : (
              "Generate Quiz (5 questions)"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
