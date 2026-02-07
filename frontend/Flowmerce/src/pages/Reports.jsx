import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

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
  const [chatStarted, setChatStarted] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const token = localStorage.getItem("access_token");

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isAtBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 10;
    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (loading || !input.trim()) return;

    if (!chatStarted) setChatStarted(true); // 👈 Trigger layout change

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    console.log("TOKEN:", token);

    try {
      const response = await fetch("http://localhost:8000/api/assistant/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      // 👇 Handle permission error nicely
      if (response.status === 403) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "🚫 This feature is part of our premium plans.\n\nVisit the Billing page to explore subscription options and unlock the AI business assistant.",
          },
        ]);
        setLoading(false);
        return;
      }

      // Optional: handle unauthenticated users
      if (response.status === 401) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Your session expired. Please log in again.",
          },
        ]);
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        partial += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") last.content = partial;
          else updated.push({ role: "assistant", content: partial });
          return updated;
        });
      }
    } catch (err) {
      console.error("Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Connection lost or timeout." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col items-center transition-all duration-500 ease-in-out ${
        chatStarted ? "justify-between h-[90vh]" : "justify-center h-[80vh]"
      } w-full bg-transparent`}
    >
      {/* Header */}
      <h1
        className={`text-2xl font-bold text-[#ff5c00] mb-4 transition-all duration-500 ${
          chatStarted ? "opacity-80 text-lg mt-4" : "text-2xl mb-8"
        }`}
      >
        Flowmerce AI Assistant 🤖
      </h1>

      {/* Chat Section */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className={`flex flex-col w-full max-w-2xl flex-1 overflow-y-auto px-4 space-y-3 transition-all duration-500 ${
          chatStarted
            ? "justify-start pt-4"
            : "justify-center items-center text-center"
        }`}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 w-full ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="p-2 bg-[#F49CAC]/40 rounded-full">
                <Bot className="w-5 h-5 text-[#ff5c00]" />
              </div>
            )}

            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap transition-all duration-300 ${
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
          <div className="flex items-center gap-2 text-gray-500 text-sm italic">
            <Bot className="w-4 h-4 animate-pulse text-[#ff5c00]" />
            <span>Thinking... please wait</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <form
        onSubmit={handleSend}
        className={`flex items-center gap-2 w-full max-w-2xl mt-6 transition-all duration-500 ${
          chatStarted ? "opacity-100 mb-4" : "opacity-90"
        }`}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your business performance..."
          className="flex-1 px-3 py-2 rounded-4xl outline-none shadow-sm focus:ring-2 focus:ring-[#ff5c00]/40 text-gray-800"
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
