// // src/components/Chatbot.jsx
// import React, { useState } from "react";
// import { sendMessageToOpenAI } from "../../api/openai";

// Ritik ka code push krenge github pr

// const Chatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     { from: "bot", text: "Hi! I'm your AI nutrition assistant. Ask me anything!" }
//   ]);
//   const [userInput, setUserInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleUserInput = async () => {
//     if (!userInput.trim()) return;

//     const newMessages = [...messages, { from: "user", text: userInput }];
//     setMessages(newMessages);
//     setLoading(true);

//     const botReply = await sendMessageToOpenAI(userInput);
//     setMessages([...newMessages, { from: "bot", text: botReply }]);
//     setUserInput("");
//     setLoading(false);
//   };

//   return (
//     <div style={{ position: "fixed", bottom: "10px", right: "10px" }}>
//       {!isOpen ? (
//         <button
//   onClick={() => setIsOpen(true)}
//   style={{
//     padding: '8px 16px',
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     borderRadius: '5px',
//     cursor: 'pointer',
//     fontSize: '16px',
//   }}
// >
//   Chat
// </button>

//       ) : (
//         <div style={{ width: "300px", border: "1px solid black", backgroundColor: "white" }}>
//           <div style={{ padding: "10px", backgroundColor: "lightgray" }}>
//             <span>AI Chatbot</span>
//             <button onClick={() => setIsOpen(false)} style={{ float: "right" }}>X</button>
//           </div>
//           <div style={{ height: "200px", overflowY: "scroll", padding: "10px" }}>
//             {messages.map((msg, index) => (
//               <div key={index} style={{ textAlign: msg.from === "user" ? "right" : "left" }}>
//                 {msg.text}
//               </div>
//             ))}
//             {loading && <div>Thinking...</div>}
//           </div>
//           <div style={{ display: "flex" }}>
//             <input
//               type="text"
//               value={userInput}
//               onChange={(e) => setUserInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
//               placeholder="Ask something..."
//               style={{ flex: 1 }}
//             />
//             <button onClick={handleUserInput}>Send</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Chatbot;


import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

const API_KEY = 'AIzaSyB8ZLcao8qK2CIND2EpTxpETYJhvZuxk6c'; // need to be in environment variable

const genAI = new GoogleGenerativeAI(API_KEY);

const App = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setResponse('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(question);
      const text = result.response.text();
      setResponse(text);
    } catch (err) {
      console.error(err);
      setResponse('❌ Error fetching response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Gemini AI Chatbot
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything..."
          className="border border-gray-300 rounded p-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>
      <div className="mt-6 bg-gray-100 p-4 rounded shadow">
        <h2 className="font-semibold text-gray-800">Response:</h2>
        <div className="mt-2 prose max-w-none">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default App;