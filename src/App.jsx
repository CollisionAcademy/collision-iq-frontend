import React, { useState, useEffect, useRef } from "react";

const API_URL = "https://<your-cloud-run-url>/webhook";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId] = useState(() => "user-" + Date.now()); // simple user session
  const eventSourceRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    // Use Server-Sent Events (SSE) for streaming
    const es = new EventSource(`${API_URL}?text=${encodeURIComponent(input)}&user_id=${userId}`);
    eventSourceRef.current = es;

    let aiResponse = "";

    es.onmessage = (event) => {
      aiResponse += event.data;
      setMessages(prev => [
        ...prev.filter(m => m.sender !== "bot-temp"),
        { sender: "bot-temp", text: aiResponse }
      ]);
    };

    es.onerror = () => {
      es.close();
      setMessages(prev => [
        ...prev.filter(m => m.sender !== "bot-temp"),
        { sender: "bot", text: aiResponse || "Error fetching response." }
      ]);
    };

    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Collision-IQ Chatbot</h1>
      <div style={{ minHeight: 200, border: "1px solid #ccc", padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ color: m.sender === "user" ? "blue" : "green" }}>
            <b>{m.sender === "user" ? "You" : "Bot"}:</b> {m.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          style={{ width: "80%" }}
        />
        <button onClick={sendMessage} style={{ marginLeft: 10 }}>Send</button>
      </div>
    </div>
  );
}

export default App;
