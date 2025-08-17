import React, { useState } from 'react';

// TEMP fallback so we can see replies even if env isn’t injected.
// After it works, switch to: const API_BASE = import.meta.env.VITE_API_URL;
const API_BASE = import.meta.env.VITE_API_URL ?? "https://collision-chatbot-172009267767.us-central1.run.app";

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastStatus, setLastStatus] = useState(null);

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;

    setMessages((m) => [...m, { sender: 'You', text: msg }]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(\`\${API_BASE}/api/message\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });

      setLastStatus(\`\${res.status} \${res.statusText}\`);

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(\`HTTP \${res.status}\${t ? \` — \${t}\` : ''}\`);
      }

      const data = await res.json();
      const reply = (data?.response ?? '').toString().trim();
      setMessages((m) => [...m, { sender: 'Bot', text: reply || '(empty reply)' }]);
    } catch (e) {
      console.error('Frontend fetch error:', e);
      setError(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Collision-IQ Chatbot — <span style={{color:'#16a34a'}}>DEBUG BUILD ✅</span></h1>

      <div style={{ fontSize: 12, color: '#6b7280', paddingBottom: 8 }}>
        API_BASE: <code>{API_BASE || '(missing VITE_API_URL)'}</code>
        {lastStatus && <> &nbsp;|&nbsp; Last POST: <code>{lastStatus}</code></>}
      </div>

      <div style={{ minHeight: 260, border: '1px solid #ccc', padding: 10, whiteSpace: 'pre-wrap', overflowY: 'auto' }}>
        {messages.length === 0 && <div style={{ color: '#777' }}>Say hello to get started…</div>}
        {messages.map((m, i) => (
          <p key={i} style={{ margin: '6px 0' }}>
            <strong style={{ color: m.sender === 'You' ? '#1a56db' : '#16a34a' }}>{m.sender}:</strong> {m.text}
          </p>
        ))}
      </div>

      {error && <div style={{ color: 'white', background: '#dc2626', padding: 8, marginTop: 8 }}>{error}</div>}
      {loading && <div style={{ marginTop: 8 }}>Sending…</div>}

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Type your message…" style={{ flex: 1, padding: 8 }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}
