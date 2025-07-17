import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { X } from "lucide-react"; // Replaced emoji with a clean icon

// ⚠️ In a real application, this key should be in a .env.local file
// and accessed via process.env.REACT_APP_GEMINI_API_KEY
const API_KEY = "AIzaSyB8ZLcao8qK2CIND2EpTxpETYJhvZuxk6c";
const genAI = new GoogleGenerativeAI(API_KEY);

const App = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setResponse("");

    try {
      // Prepending a context prompt for better, more relevant answers
      const nutritionContextPrompt = `You are a friendly and helpful nutrition assistant for the TrackEats app. Please answer the following user question about nutrition, health, or fitness in a clear and encouraging way. Question: "${question}"`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(nutritionContextPrompt);
      const text = result.response.text();
      setResponse(text);
    } catch (err) {
      console.error("Gemini API Error:", err);
      setResponse("Sorry, I encountered an error trying to get an answer. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button - Styled with the theme's primary color */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-light flex items-center justify-center w-16 h-16 rounded-full font-bold shadow-soft transition-all duration-300 hover:bg-primary-hover hover:shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Ask AI assistant"
        >
          <span className="text-3xl">?</span>
        </button>
      </div>

      {/* Modal with backdrop */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50 animate-fade-in">
          {/* Modal Card - Styled with theme's section colors and soft shadow */}
          <div className="bg-section p-6 rounded-xl shadow-soft w-full max-w-lg relative flex flex-col animate-fade-up">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-body p-2 rounded-full hover:bg-light hover:text-heading transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            {/* Heading uses the theme's secondary font and heading color */}
            <h2 className="text-xl font-['Lora'] font-bold text-heading mb-4">
              Ask Your Nutrition Assistant
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What are good sources of vegan protein?"
                className="w-full bg-main border border-custom p-3 rounded-md text-body placeholder:text-body/60 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-light px-4 py-3 font-semibold rounded-md hover:bg-primary-hover transition-colors duration-200 disabled:bg-primary/50 disabled:cursor-not-allowed"
              >
                {loading ? "Thinking..." : "Get Answer"}
              </button>
            </form>

            {response && (
              <div className="mt-5 border-t border-custom pt-4 max-h-64 overflow-y-auto custom-scrollbar text-body">
                {/* Prose classes from Tailwind Typography can be used here for even better markdown styling */}
                <ReactMarkdown className="prose prose-sm max-w-none">
                    {response}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default App;