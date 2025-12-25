export default function RightSidebar({ age, setAge, packs, selectedPack, setSelectedPack, setInput }) {
  return (
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
  );
}
