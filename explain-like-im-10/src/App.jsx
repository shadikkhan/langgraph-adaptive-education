import { useEffect, useState, useRef } from "react";
import "./App.css";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import QuizSetup from "./components/QuizSetup";
import QuizContainer from "./components/QuizContainer";
import MessageList from "./components/MessageList";
import InputBox from "./components/InputBox";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useChatStorage } from "./hooks/useChatStorage";

// Get chat retention hours from environment variable (default 24 hours)
const CHAT_RETENTION_HOURS = Number(import.meta.env.VITE_CHAT_RETENTION_HOURS) || 24;
const CHAT_RETENTION_MS = CHAT_RETENTION_HOURS * 60 * 60 * 1000;

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [age, setAge] = useState(10);
  const [packs, setPacks] = useState({});
  const [selectedPack, setSelectedPack] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Use custom hooks
  const { isListening, toggleListening } = useSpeechRecognition(setInput);
  useChatStorage(chats, setChats, activeChatId, setActiveChatId, CHAT_RETENTION_MS);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/topics`)
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/quiz/generate`, {
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
    if (isListening) {
      toggleListening();
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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/explain/stream`, {
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
      <LeftSidebar 
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        startNewChat={startNewChat}
      />

      <main className="chat">
        {activeChat?.showQuizSetup ? (
          <QuizSetup
            activeChat={activeChat}
            activeChatId={activeChatId}
            quizDifficulty={quizDifficulty}
            setQuizDifficulty={setQuizDifficulty}
            age={age}
            setAge={setAge}
            isGeneratingQuiz={isGeneratingQuiz}
            setChats={setChats}
            startQuiz={startQuiz}
          />
        ) : activeChat?.quizState ? (
          <QuizContainer
            activeChat={activeChat}
            activeChatId={activeChatId}
            setChats={setChats}
            submitQuizAnswer={submitQuizAnswer}
            nextQuestion={nextQuestion}
          />
        ) : (
          <>
            <div className="messages">
              <MessageList
                activeChat={activeChat}
                messagesEndRef={messagesEndRef}
                handleAudioPlay={handleAudioPlay}
              />
            </div>

            <InputBox
              input={input}
              setInput={setInput}
              send={send}
              isListening={isListening}
              toggleListening={toggleListening}
              textareaRef={textareaRef}
              activeChat={activeChat}
              showQuizSetupUI={showQuizSetupUI}
            />
          </>
        )}
      </main>

      <RightSidebar
        age={age}
        setAge={setAge}
        packs={packs}
        selectedPack={selectedPack}
        setSelectedPack={setSelectedPack}
        setInput={setInput}
      />
    </div>
  );
}
