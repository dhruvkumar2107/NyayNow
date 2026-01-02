import { useState } from "react";
import { useAuth } from "../context/AuthContext";

/* ---------------------------------------
   MOCK CONVERSATIONS (BACKEND LATER)
--------------------------------------- */
const MOCK_CHATS = [
  {
    id: 1,
    name: "Adv. Rahul Sharma",
    role: "lawyer",
    lastMessage: "Please share the FIR details.",
  },
  {
    id: 2,
    name: "Adv. Neha Verma",
    role: "lawyer",
    lastMessage: "I can help you with company incorporation.",
  },
];

export default function Messages() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0]);
  const [messages, setMessages] = useState([
    { from: "lawyer", text: "Hello, how can I help you?" },
    { from: "client", text: "I have a legal issue." },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { from: "client", text: input }]);
    setInput("");
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 flex pt-24 pb-4 px-4 h-screen">
      <div className="flex-1 max-w-[1128px] mx-auto flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* SIDEBAR */}
        <aside className="w-80 border-r border-gray-200 p-4 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">
            Messages
          </h2>

          <div className="space-y-2">
            {MOCK_CHATS.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`p-4 rounded-xl cursor-pointer transition flex flex-col gap-1 ${activeChat.id === chat.id
                  ? "bg-blue-50 border border-blue-100 shadow-sm"
                  : "hover:bg-gray-100 border border-transparent"
                  }`}
              >
                <p className={`font-semibold ${activeChat.id === chat.id ? "text-blue-700" : "text-gray-900"}`}>{chat.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* CHAT AREA */}
        <section className="flex-1 flex flex-col bg-white">
          {/* HEADER */}
          <header className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">{activeChat.name[0]}</div>
              {activeChat.name}
            </h3>
          </header>

          {/* MESSAGES */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-md px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.from === "client"
                  ? "bg-blue-600 text-white ml-auto rounded-tr-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                  }`}
              >
                {msg.text}
              </div>
            ))}

            {/* UNIQUE AI ASSIST */}
            {user?.plan !== "silver" && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800 shadow-sm mx-auto max-w-lg mt-8">
                💡 <strong>AI Legal Assist:</strong>
                You may want to ask about applicable IPC sections or
                jurisdiction.
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="p-4 border-t border-gray-100 flex gap-3 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-200"
            >
              Send
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
