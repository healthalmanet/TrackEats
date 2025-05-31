// src/api/openai.js
import axios from "axios";

const OPENAI_API_KEY = "sk-"; // ⚠️ Replace with your key for testing only

export const sendMessageToOpenAI = async (userMessage) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful nutrition assistant." },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Sorry, I couldn't respond right now.";
  }
};
