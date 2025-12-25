export default function MessageList({ activeChat, messagesEndRef, handleAudioPlay }) {
  if (!activeChat) {
    return <p className="empty">Start a new topic 👋</p>;
  }

  return (
    <>
      {activeChat.messages.map((m, i) => (
        <div key={i} className={`msg ${m.role}`}>
          {m.role === "assistant" && m.sections ? (
            <>
              {m.sections.Feedback ? (
                // Only show Feedback section if this is an answer evaluation
                <div className="assistant-section feedback" style={{ marginBottom: "16px" }}>
                  <strong>Feedback:</strong> {m.sections.Feedback}
                  {m.streaming && <span className="cursor">▋</span>}
                </div>
              ) : (
                // Show Explanation, Example, Question for topic explanations
                <>
                  {(m.sections.Explanation || (m.streaming && !m.sections.Example && !m.sections.Question)) && (
                    <div className="assistant-section explanation" style={{ marginBottom: "16px" }}>
                      <strong>Explanation:</strong> {m.sections.Explanation}
                      {m.streaming && !m.sections.Explanation && <span className="cursor">▋</span>}
                    </div>
                  )}
                  {(m.sections.Example || (m.streaming && m.sections.Explanation && !m.sections.Question)) && (
                    <div className="assistant-section example" style={{ marginBottom: "16px" }}>
                      <strong>Example:</strong> {m.sections.Example}
                      {m.streaming && m.sections.Explanation && !m.sections.Example && <span className="cursor">▋</span>}
                    </div>
                  )}
                  {(m.sections.Question || (m.streaming && m.sections.Example)) && (
                    <div className="assistant-section question" style={{ marginBottom: "16px" }}>
                      <strong>Question:</strong> {m.sections.Question}
                      {m.streaming && m.sections.Example && !m.sections.Question && <span className="cursor">▋</span>}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="message-text">
              {m.isAnswer && <span className="answer-badge">Answer:</span>}
              {m.text}
            </div>
          )}

          {m.audio_url && (
            <div className="assistant-section audio" style={{ marginBottom: "16px", marginTop: "16px" }}>
              <audio
                controls
                src={`${import.meta.env.VITE_API_URL}${m.audio_url}`}
                style={{ width: "100%" }}
                onPlay={handleAudioPlay}
              />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  );
}
