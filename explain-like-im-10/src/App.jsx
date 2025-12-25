import { useEffect, useState, useRef } from "react";
import "./App.css";

// Get chat retention hours from environment variable (default 24 hours)
const CHAT_RETENTION_HOURS = Number(import.meta.env.VITE_CHAT_RETENTION_HOURS) || 24;
const CHAT_RETENTION_MS = CHAT_RETENTION_HOURS * 60 * 60 * 1000;

// LocalStorage keys
const CHATS_STORAGE_KEY = 'chat_list';
const ACTIVE_CHAT_ID_KEY = 'active_chat_id';

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [age, setAge] = useState(10);
  const [packs, setPacks] = useState({});
  const [selectedPack, setSelectedPack] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState("medium"); // "easy", "medium", "hard"
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false); // Loading state for quiz generation
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Load chats from localStorage on mount and clean up expired chats
  useEffect(() => {
    const loadChats = () => {
      try {
        const stored = localStorage.getItem(CHATS_STORAGE_KEY);
        if (stored) {
          const parsedChats = JSON.parse(stored);
          const now = Date.now();
          
          // Filter out chats older than retention period
          const validChats = parsedChats.filter(chat => {
            const chatAge = now - chat.createdAt;
            return chatAge < CHAT_RETENTION_MS;
          });
          
          // Only set chats if we have valid ones
          if (validChats.length > 0) {
            setChats(validChats);
            
            // Restore active chat ID if it still exists
            const storedActiveChatId = localStorage.getItem(ACTIVE_CHAT_ID_KEY);
            if (storedActiveChatId) {
              const activeChatIdNum = Number(storedActiveChatId);
              // Only restore if the chat still exists in valid chats
              if (validChats.some(chat => chat.id === activeChatIdNum)) {
                setActiveChatId(activeChatIdNum);
              } else {
                // Clear invalid active chat ID
                localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
              }
            }
          }
          
          // Update localStorage if we removed any chats
          if (validChats.length !== parsedChats.length) {
            localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(validChats));
          }
        }
      } catch (error) {
        console.error('Error loading chats from localStorage:', error);
      }
    };
    
    loadChats();
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      try {
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
      } catch (error) {
        console.error('Error saving chats to localStorage:', error);
      }
    }
  }, [chats]);

  // Save active chat ID to localStorage whenever it changes
  useEffect(() => {
    if (activeChatId !== null) {
      localStorage.setItem(ACTIVE_CHAT_ID_KEY, String(activeChatId));
    } else {
      localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
    }
  }, [activeChatId]);

  // Set up interval to check for expired chats every hour
  useEffect(() => {
    const checkExpiredChats = () => {
      const now = Date.now();
      setChats(prevChats => {
        const validChats = prevChats.filter(chat => {
          const chatAge = now - chat.createdAt;
          return chatAge < CHAT_RETENTION_MS;
        });
        
        // If some chats were removed, update localStorage
        if (validChats.length !== prevChats.length) {
          if (validChats.length > 0) {
            localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(validChats));
            
            // Check if active chat was removed
            setActiveChatId(prevActiveId => {
              if (prevActiveId && !validChats.some(chat => chat.id === prevActiveId)) {
                localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
                return null;
              }
              return prevActiveId;
            });
          } else {
            localStorage.removeItem(CHATS_STORAGE_KEY);
            localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
            setActiveChatId(null);
          }
        }
        
        return validChats;
      });
    };
    
    // Check every hour
    const intervalId = setInterval(checkExpiredChats, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/topics")
      .then(res => res.json())
      .then(setPacks);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Function to pause all other audio players
  const handleAudioPlay = (e) => {
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
      if (audio !== e.target) {
        audio.pause();
      }
    });
  };

  // Function to start a new chat
  const startNewChat = () => {
    setActiveChatId(null);
    setInput("");
  };

  // Function to show quiz setup UI for current chat
  const showQuizSetupUI = () => {
    if (!activeChatId) {
      alert("Please start a chat first!");
      return;
    }
    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? { ...c, showQuizSetup: true, quizTopic: c.topic || "" }
          : c
      )
    );
  };

  // Function to generate and start quiz
  const startQuiz = async () => {
    if (!activeChatId) return;
    
    const chat = chats.find(c => c.id === activeChatId);
    const quizTopic = chat?.quizTopic?.trim();
    
    if (!quizTopic) {
      alert("Please enter a topic for the quiz!");
      return;
    }
    setIsGeneratingQuiz(true);
    
    try {
      const res = await fetch(`http://localhost:8000/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: quizTopic,
          age,
          num_questions: 5,
          difficulty: quizDifficulty
        })
      });
      
      const data = await res.json();
      
      if (data.questions) {
        setChats(prev =>
          prev.map(c =>
            c.id === activeChatId
              ? {
                  ...c,
                  quizState: {
                    topic: data.topic,
                    questions: data.questions,
                    currentIndex: 0,
                    score: 0,
                    answers: [],
                    showingFeedback: false
                  },
                  showQuizSetup: false
                }
              : c
          )
        );
      } else if (data.error) {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Function to submit quiz answer
  const submitQuizAnswer = async (selectedOption) => {
    if (!activeChatId) return;
    
    setChats(prev =>
      prev.map(c => {
        if (c.id !== activeChatId || !c.quizState) return c;
        
        const currentQuestion = c.quizState.questions[c.quizState.currentIndex];
        const isCorrect = selectedOption === currentQuestion.correct;
        
        const updatedAnswers = [...c.quizState.answers, {
          question: currentQuestion.question,
          userAnswer: selectedOption,
          correctAnswer: currentQuestion.correct,
          isCorrect,
          explanation: currentQuestion.explanation
        }];
        
        const newScore = isCorrect ? c.quizState.score + 1 : c.quizState.score;
        
        return {
          ...c,
          quizState: {
            ...c.quizState,
            answers: updatedAnswers,
            score: newScore,
            showingFeedback: true,
            currentIsCorrect: isCorrect
          }
        };
      })
    );
  };

  // Function to move to next question (manual control)
  const nextQuestion = () => {
    if (!activeChatId) return;
    
    setChats(prev =>
      prev.map(c => {
        if (c.id !== activeChatId || !c.quizState) return c;
        
        if (c.quizState.currentIndex < c.quizState.questions.length - 1) {
          return {
            ...c,
            quizState: {
              ...c.quizState,
              currentIndex: c.quizState.currentIndex + 1,
              showingFeedback: false,
              currentIsCorrect: null
            }
          };
        } else {
          return {
            ...c,
            quizState: {
              ...c.quizState,
              completed: true,
              showingFeedback: false
            }
          };
        }
      })
    );
  };

  async function send() {
    const text = input.trim();
    if (!text) return;

    // Stop listening if microphone is active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    let chatId = activeChatId;

    if (!chatId) {
      chatId = Date.now();
      setChats(prev => [
        {
          id: chatId,
          topic: text,
          age,
          createdAt: Date.now(),
          messages: [{ role: "user", text }]
        },
        ...prev
      ]);
      setActiveChatId(chatId);
    } else {
      setChats(prev =>
        prev.map(c =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, { role: "user", text }] }
            : c
        )
      );
    }
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add placeholder assistant message that will be updated with streaming data
    const assistantMsgIndex = activeChat ? activeChat.messages.length + 1 : 1;
    setChats(prev =>
      prev.map(c =>
        c.id === chatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  role: "assistant",
                  sections: { Explanation: "", Example: "", Question: "", Feedback: "" },
                  audio_url: null,
                  streaming: true
                }
              ]
            }
          : c
      )
    );

    try {
      // Build conversation context from all previous messages
      const conversationHistory = activeChat?.messages
        .map(m => {
          if (m.role === "user") {
            return `User: ${m.text}`;
          } else if (m.role === "assistant" && m.sections) {
            const parts = [];
            if (m.sections.Explanation) parts.push(`Explanation: ${m.sections.Explanation}`);
            if (m.sections.Example) parts.push(`Example: ${m.sections.Example}`);
            if (m.sections.Question) parts.push(`Question: ${m.sections.Question}`);
            if (m.sections.Feedback) parts.push(`Feedback: ${m.sections.Feedback}`);
            return parts.join("\n");
          }
          return "";
        })
        .filter(m => m)
        .join("\n\n");

      const requestBody = { 
        topic: text, 
        age,
        context: conversationHistory || ""
      };

      const res = await fetch(`http://localhost:8000/explain/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "section") {
                // Section marker - no action needed
              } else if (data.type === "content") {
                const section = data.section;
                const text = data.text;
                
                setChats(prev =>
                  prev.map(c =>
                    c.id === chatId
                      ? {
                          ...c,
                          messages: c.messages.map((msg, idx) =>
                            idx === assistantMsgIndex && msg.streaming
                              ? {
                                  ...msg,
                                  sections: {
                                    ...msg.sections,
                                    [section]: (msg.sections[section] || "") + text
                                  }
                                }
                              : msg
                          )
                        }
                      : c
                  )
                );
              } else if (data.type === "update") {
                const section = data.section;
                const text = data.text;
                
                setChats(prev =>
                  prev.map(c =>
                    c.id === chatId
                      ? {
                          ...c,
                          messages: c.messages.map((msg, idx) =>
                            idx === assistantMsgIndex && msg.streaming
                              ? {
                                  ...msg,
                                  sections: {
                                    ...msg.sections,
                                    [section]: text
                                  }
                                }
                              : msg
                          )
                        }
                      : c
                  )
                );
              } else if (data.type === "audio") {
                setChats(prev =>
                  prev.map(c =>
                    c.id === chatId
                      ? {
                          ...c,
                          messages: c.messages.map((msg, idx) =>
                            idx === assistantMsgIndex && msg.streaming
                              ? { ...msg, audio_url: data.url }
                              : msg
                          )
                        }
                      : c
                  )
                );
              } else if (data.type === "done") {
                setChats(prev =>
                  prev.map(c =>
                    c.id === chatId
                      ? {
                          ...c,
                          messages: c.messages.map((msg, idx) =>
                            idx === assistantMsgIndex && msg.streaming
                              ? { ...msg, streaming: false }
                              : msg
                          )
                        }
                      : c
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching explanation:", error);
      // Remove streaming flag on error
      setChats(prev =>
        prev.map(c =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((msg, idx) =>
                  idx === assistantMsgIndex && msg.streaming
                    ? { ...msg, streaming: false, error: true }
                    : msg
                )
              }
            : c
        )
      );
    }
  }

  return (
    <div className="app">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar left">
        <button className="new-chat-btn" onClick={startNewChat}>
          + Start New Chat
        </button>
        <h3>Chats</h3>
        {chats.map(c => (
          <div
            key={c.id}
            className={`chat-item ${c.id === activeChatId ? "active" : ""}`}
            onClick={() => setActiveChatId(c.id)}
          >
            {c.topic}
          </div>
        ))}
      </aside>

      {/* CENTER CHAT */}
      <main className="chat">
        {activeChat?.showQuizSetup ? (
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
        ) : activeChat?.quizState ? (
          <div className="quiz-container">
            {!activeChat.quizState.completed ? (
              <>
                <div className="quiz-header">
                  <h2>Quiz: {activeChat.quizState.topic}</h2>
                  <div className="quiz-progress">
                    Question {activeChat.quizState.currentIndex + 1} of {activeChat.quizState.questions.length}
                    <span style={{ marginLeft: "16px" }}>Score: {activeChat.quizState.score}/{activeChat.quizState.currentIndex}</span>
                  </div>
                </div>
                
                <div className="quiz-question">
                  <h3>{activeChat.quizState.questions[activeChat.quizState.currentIndex].question}</h3>
                  
                  <div className="quiz-options">
                    {Object.entries(activeChat.quizState.questions[activeChat.quizState.currentIndex].options).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => submitQuizAnswer(key)}
                        disabled={activeChat.quizState.showingFeedback}
                        className={`quiz-option ${
                          activeChat.quizState.showingFeedback && key === activeChat.quizState.questions[activeChat.quizState.currentIndex].correct
                            ? 'correct'
                            : activeChat.quizState.showingFeedback && key === activeChat.quizState.answers[activeChat.quizState.answers.length - 1]?.userAnswer
                            ? 'incorrect'
                            : ''
                        }`}
                        style={{
                          padding: "16px",
                          margin: "8px 0",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          background: "white",
                          cursor: activeChat.quizState.showingFeedback ? "not-allowed" : "pointer",
                          textAlign: "left",
                          width: "100%"
                        }}
                      >
                        <strong>{key}.</strong> {value}
                      </button>
                    ))}
                  </div>
                  
                  {activeChat.quizState.showingFeedback && (
                    <>
                      <div className={`quiz-feedback ${activeChat.quizState.currentIsCorrect ? 'correct' : 'incorrect'}`}
                           style={{
                             marginTop: "16px",
                             padding: "16px",
                             borderRadius: "8px",
                             background: activeChat.quizState.currentIsCorrect ? "#d4edda" : "#f8d7da",
                             color: activeChat.quizState.currentIsCorrect ? "#155724" : "#721c24"
                           }}>
                        <strong>{activeChat.quizState.currentIsCorrect ? "✓ Correct!" : "✗ Not quite!"}</strong>
                        <p>{activeChat.quizState.questions[activeChat.quizState.currentIndex].explanation}</p>
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
                        {activeChat.quizState.currentIndex < activeChat.quizState.questions.length - 1 ? "Next Question →" : "View Results"}
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="quiz-results">
                <h2>Quiz Complete! 🎉</h2>
                <div className="final-score" style={{ fontSize: "2em", margin: "24px 0" }}>
                  Score: {activeChat.quizState.score}/{activeChat.quizState.questions.length}
                  <div style={{ fontSize: "0.5em", marginTop: "8px" }}>
                    {Math.round((activeChat.quizState.score / activeChat.quizState.questions.length) * 100)}%
                  </div>
                </div>
                
                <h3>Review:</h3>
                {activeChat.quizState.answers.map((answer, i) => (
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
                          ? { ...c, quizTopic: activeChat.quizState.topic, showQuizSetup: true, quizState: null }
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
            )}
          </div>
        ) : (
          <>
            <div className="messages">
              {activeChat ? (
                activeChat.messages.map((m, i) => (
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
                    )}                  </>
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
                      src={`http://localhost:8000${m.audio_url}`}
                      style={{ width: "100%" }}
                      onPlay={handleAudioPlay}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty">Start a new topic 👋</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
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
          </>
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="sidebar right">
        <h3>Difficulty</h3>
        <label>Age: {age}</label>
        <input
          type="range"
          min="5"
          max="35"
          value={age}
          onChange={e => setAge(Number(e.target.value))}
        />

        <h3>Topic Packs</h3>
        <select
          onChange={e => setSelectedPack(e.target.value)}
          value={selectedPack}
        >
          <option value="">Select pack</option>
          {Object.keys(packs).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {selectedPack && (
          <div className="topics">
            {packs[selectedPack].map(t => (
              <button key={t} onClick={() => setInput(t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
