// src/components/Chatbot.jsx
import React, { useState } from "react";
import { sendMessageToOpenAI } from "../../api/openai";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your AI nutrition assistant. Ask me anything!" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUserInput = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { from: "user", text: userInput }];
    setMessages(newMessages);
    setLoading(true);

    const botReply = await sendMessageToOpenAI(userInput);
    setMessages([...newMessages, { from: "bot", text: botReply }]);
    setUserInput("");
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: "10px", right: "10px" }}>
      {!isOpen ? (
        <button
  onClick={() => setIsOpen(true)}
  style={{
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  }}
>
  Chat
</button>

      ) : (
        <div style={{ width: "300px", border: "1px solid black", backgroundColor: "white" }}>
          <div style={{ padding: "10px", backgroundColor: "lightgray" }}>
            <span>AI Chatbot</span>
            <button onClick={() => setIsOpen(false)} style={{ float: "right" }}>X</button>
          </div>
          <div style={{ height: "200px", overflowY: "scroll", padding: "10px" }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.from === "user" ? "right" : "left" }}>
                {msg.text}
              </div>
            ))}
            {loading && <div>Thinking...</div>}
          </div>
          <div style={{ display: "flex" }}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
              placeholder="Ask something..."
              style={{ flex: 1 }}
            />
            <button onClick={handleUserInput}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
