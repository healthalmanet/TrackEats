import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { FaRocketchat } from "react-icons/fa";

// ⚠️ In production, move this to a .env file
const API_KEY = "AIzaSyB8ZLcao8qK2CIND2EpTxpETYJhvZuxk6c";
const genAI = new GoogleGenerativeAI(API_KEY);

const App = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(question);
      const text = result.response.text();
      setResponse(text);
    } catch (err) {
      console.error(err);
      setResponse("❌ Error fetching response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <div
          onClick={() => setShowModal(true)}
          className="bg-[#00bd00] hover:bg-green-700 rounded-full p-3 flex items-center gap-2 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105"
        >
          <FaRocketchat className="text-white" />
          <span className="text-white font-medium">Let's Chat</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0  flex justify-end items-end z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ❌
            </button>

            <h2 className="text-xl font-bold mb-4">Ask a Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question..."
                className="w-full border border-gray-300 p-2 rounded-md"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </form>

            {response && (
              <div className="mt-4 border-t pt-4 max-h-60 overflow-y-auto">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </>
 );  
};

export default App;
