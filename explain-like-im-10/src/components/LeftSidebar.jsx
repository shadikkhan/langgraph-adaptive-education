export default function LeftSidebar({ chats, activeChatId, setActiveChatId, startNewChat }) {
  return (
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
  );
}
