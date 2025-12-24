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
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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

  async function send() {
    const text = input.trim();
    if (!text) return;

    let chatId = activeChatId;

    if (!chatId) {
      chatId = Date.now();
      setChats(prev => [
        {
          id: chatId,
          topic: text,
          age,
          createdAt: Date.now(), // Add timestamp for expiration tracking
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
                  sections: { Explanation: "", Example: "", Question: "" },
                  audio_url: null,
                  streaming: true
                }
              ]
            }
          : c
      )
    );

    try {
      const res = await fetch("http://localhost:8000/explain/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: text, age })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let currentSection = "";

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
                currentSection = data.section;
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
        <div className="messages">
          {activeChat ? (
            activeChat.messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.role === "assistant" && m.sections ? (
                  <>
                    <div className="assistant-section explanation" style={{ marginBottom: "16px" }}>
                      <strong>Explanation:</strong> {m.sections.Explanation}
                      {m.streaming && !m.sections.Explanation && <span className="cursor">▋</span>}
                    </div>
                    <div className="assistant-section example" style={{ marginBottom: "16px" }}>
                      <strong>Example:</strong> {m.sections.Example}
                      {m.streaming && m.sections.Explanation && !m.sections.Example && <span className="cursor">▋</span>}
                    </div>
                    <div className="assistant-section question" style={{ marginBottom: "16px" }}>
                      <strong>Question:</strong> {m.sections.Question}
                      {m.streaming && m.sections.Example && !m.sections.Question && <span className="cursor">▋</span>}
                    </div>
                  </>
                ) : (
                  <div className="message-text">{m.text}</div>
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
              placeholder="Ask a topic..."
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
            />
            <button className="send-icon" onClick={send} title="Send message">
              ➤
            </button>
          </div>
        </div>
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
