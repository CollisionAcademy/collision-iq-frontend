import React, { useState } from "react";

function Chat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/message`);
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      console.error("❌ Error connecting to Gemini:", err);
      setResponse("Error: Could not get a response from Gemini.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h2>💬 Collision Chatbot</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini something..."
          style={{ width: "100%", padding: "10px", fontSize: "1rem" }}
        />
        <button type="submit" style={{ marginTop: "10px", padding: "10px" }}>
          Send
        </button>
      </form>

      {response && (
        <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
          <strong>Gemini:</strong> {response}
        </div>
      )}
    </div>
  );
}

export default Chat;
