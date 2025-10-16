import React, { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import api from "../utils/api";

const Reports = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello 👋 I'm your business assistant. You can ask me about sales, orders, or performance — or even general business insights.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input.trim() },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("assistant/", { message: input.trim() });
      const aiReply =
        res.data.reply || "Hmm... I couldn’t get that. Please try again.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ There was an error reaching the assistant. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-transparent rounded-xl shadow-md p-4">
      {/* Header */}
      <div className="bg-[#ff5c00] text-white rounded-xl py-3 px-5 font-semibold text-lg mb-3 shadow">
        Flowmerce AI Assistant 🤖
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-white rounded-xl shadow-inner">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="p-2 bg-[#F49CAC]/40 rounded-full">
                <Bot className="w-5 h-5 text-[#ff5c00]" />
              </div>
            )}

            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-[#ff5c00] text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>

            {msg.role === "user" && (
              <div className="p-2 bg-[#ff5c00]/20 rounded-full">
                <User className="w-5 h-5 text-[#ff5c00]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Bot className="w-4 h-4 animate-pulse text-[#ff5c00]" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 mt-3 bg-white p-2 rounded-xl shadow-inner"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your business performance..."
          className="flex-1 px-3 py-2 rounded-xl outline-none border border-gray-200 focus:ring-2 focus:ring-[#ff5c00]/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#ff5c00] text-white p-2 rounded-xl hover:bg-[#e14e00] transition disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default Reports;
