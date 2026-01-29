import React, { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Sparkles, Moon, Sun, Mic } from "lucide-react";
import VoiceConversationModal from './VoiceConversationModal';
import { useConversation } from '../context/ConversationContext';
import { getBackendToken } from '../utils/backendAuth';
import { API_BASE } from '../config';

export const AIAssistant = ({ compact = false }) => {
  const { messages, addMessage, setConversation } = useConversation();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Live media panel collapsed by default (text-first UX)
  const [voiceOpen, setVoiceOpen] = useState(false);
  const bottomRef = useRef(null);

  // Simple session persistence for AI chat
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('ms_ai_current_session'));

  // Initialize session and load messages
  useEffect(() => {
    const ensureSession = () => {
      let id = localStorage.getItem('ms_ai_current_session');
      if (!id) {
        id = `ai-${Date.now()}`;
        localStorage.setItem('ms_ai_current_session', id);
        const sessions = JSON.parse(localStorage.getItem('ms_ai_sessions') || '[]');
        const next = [{ id, title: 'New chat', updatedAt: Date.now() }, ...sessions];
        localStorage.setItem('ms_ai_sessions', JSON.stringify(next));
      }
      setSessionId(id);
      try {
        const raw = localStorage.getItem(`ms_ai_messages_${id}`);
        const loaded = raw ? JSON.parse(raw) : [];
        if (loaded.length) setConversation(loaded);
      } catch {}
    };
    ensureSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages and update sessions list
  useEffect(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem(`ms_ai_messages_${sessionId}`, JSON.stringify(messages));
      const sessions = JSON.parse(localStorage.getItem('ms_ai_sessions') || '[]');
      const title = messages.find(m => m.role === 'user')?.text?.slice(0, 40) || 'New chat';
      const next = [{ id: sessionId, title, updatedAt: Date.now() }, ...sessions.filter(s => s.id !== sessionId)];
      localStorage.setItem('ms_ai_sessions', JSON.stringify(next));
    } catch {}
  }, [messages, sessionId]);

  // React to external session switches (from ChatPage sidebar)
  useEffect(() => {
    const i = setInterval(() => {
      const externalId = localStorage.getItem('ms_ai_current_session');
      if (externalId && externalId !== sessionId) {
        setSessionId(externalId);
        try {
          const raw = localStorage.getItem(`ms_ai_messages_${externalId}`);
          setConversation(raw ? JSON.parse(raw) : []);
        } catch { setConversation([]) }
      }
    }, 600);
    return () => clearInterval(i);
  }, [sessionId, setConversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Live / realtime removed for prototype presentation mode. Text chat only.

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: 'user', text: inputText, timestamp: new Date().toLocaleTimeString() };
    addMessage(userMessage);
    setInputText("");
    setIsLoading(true);

    try {
      // Get backend JWT token (guest login)
      const token = await getBackendToken();

      // Call backend /api/chat endpoint which uses Amazon Nova Pro via Bedrock
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // Backend expects x-auth-token header
        },
        body: JSON.stringify({
          message: inputText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Amazon Nova Pro response:", data);

      // Extract the reply from the backend response
      if (data.reply) {
        const aiMessage = {
          role: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString(),
          model: data.model || 'amazon.nova-pro-v1:0', // Include model info for debugging
        };
        addMessage(aiMessage);
      } else {
        throw new Error("No valid AI response");
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'ai',
        text: "I'm sorry, I'm having trouble connecting right now. Please know that your feelings are valid and you're not alone.",
        timestamp: new Date().toLocaleTimeString(),
      };
      addMessage(errorMessage);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickResponses = [
    "I'm feeling anxious",
    "I need someone to talk to",
    "I'm having trouble sleeping",
    "I feel overwhelmed",
  ];

  const themeClasses = isDarkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-800";

  return (
    <div className={`${compact ? 'w-full' : 'min-h-screen'} transition-all duration-300 ${themeClasses} flex`}>
      {/* Sidebar history */}
      <aside className="sticky top-24 hidden w-72 h-[calc(100vh-6rem)] px-3 bg-white border-r border-gray-200 md:block">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold">Chats</div>
          <button onClick={() => {
            const id = `ai-${Date.now()}`;
            localStorage.setItem('ms_ai_current_session', id);
            const sessions = JSON.parse(localStorage.getItem('ms_ai_sessions') || '[]');
            const next = [{ id, title: 'New chat', updatedAt: Date.now() }, ...sessions];
            localStorage.setItem('ms_ai_sessions', JSON.stringify(next));
            setConversation([]);
          }} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">New</button>
        </div>
        <AIAssistantHistory sessionId={sessionId} />
      </aside>
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
  <div className={`${isDarkMode ? "bg-gray-800/95 border-gray-700" : "bg-white/85 border-blue-200"} backdrop-blur border-b sticky top-0 z-20 w-full`}> 
          <div className="flex flex-col max-w-4xl gap-3 px-4 py-3 mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-semibold">Metoo | MitrAI Assistant</h1>
                  <div className="flex items-center gap-2 text-xs">
                    <span className='text-gray-500'>Text chat mode</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-colors ${isDarkMode? 'hover:bg-gray-700':'hover:bg-gray-200'}`}>{isDarkMode? <Sun className="w-5 h-5"/>:<Moon className="w-5 h-5"/>}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className={`p-4 ${compact ? 'pb-6' : 'pb-32'} h-full use-twemoji`}>
        {/* Messages */}
        <div className="mb-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                (message.role || message.sender) === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl flex items-start space-x-2 ${
                  (message.role || message.sender) === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                {((message.role || message.sender) === "user") ? (
                  <div className={`p-2 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-500'}`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <img src="/MitraSetu-Mascot.jpg" alt="Mitra mascot" className="flex-shrink-0 rounded-full shadow w-7 h-7" />
                )}
                <div
                  className={`p-4 rounded-2xl shadow-sm ${
                    (message.role || message.sender) === "user"
                      ? isDarkMode
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-500 text-white"
                      : isDarkMode
                      ? "bg-gray-700 text-gray-100"
                      : "bg-gray-50 text-gray-800 border border-gray-200"
                  } ${(message.role || message.sender) === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      (message.role || message.sender) === "user"
                        ? "text-emerald-100"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp || new Date(message.ts || Date.now()).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className={`p-4 rounded-2xl rounded-bl-md ${
                  isDarkMode ? "bg-gray-700" : "bg-white"
                } shadow-sm`}
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

  {/* Modal handled media; inline panel removed */}

        {/* Quick Response Buttons - only before first user message in a session */}
        {messages.every(m => m.role !== 'user') && (
        <div className="mb-6">
          <p
            className={`text-sm mb-3 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Quick responses:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => setInputText(response)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 shadow-sm"
                } border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
              >
                {response}
              </button>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Close content column */}
      </div>

      {/* Input Area */}
      <div
        className={`fixed bottom-0 left-0 right-0 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white/95'
        } backdrop-blur-sm border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className={`p-4 mx-auto ${compact ? 'pt-0' : ''}`}>
          <div className="flex space-x-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind... I'm here to listen."
              className={`flex-1 p-4 rounded-2xl border resize-none ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              rows="1"
              style={{ minHeight: "60px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`p-4 rounded-2xl transition-all duration-200 ${
                inputText.trim() && !isLoading
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-xl"
                  : isDarkMode
                  ? "bg-gray-600"
                  : "bg-gray-300"
              } text-white disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <Sparkles className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={()=> setVoiceOpen(true)}
              className={`p-4 rounded-2xl transition-colors ${isDarkMode? 'bg-blue-600 hover:bg-blue-500':'bg-blue-500 hover:bg-blue-600'} text-white`}
              title="Open voice session"
            >
              <Mic className="w-5 h-5"/>
            </button>
          </div>
          <p
            className={`text-xs mt-2 text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Press Enter to send • This is a safe space for you to express yourself
          </p>
        </div>
      </div>
  <VoiceConversationModal open={voiceOpen} onClose={()=> setVoiceOpen(false)} dark={isDarkMode} />
    </div>
  );
};

function AIAssistantHistory({ sessionId }) {
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ms_ai_sessions') || '[]') } catch { return [] }
  })
  useEffect(() => {
    const i = setInterval(() => {
      try { setSessions(JSON.parse(localStorage.getItem('ms_ai_sessions') || '[]')) } catch {}
    }, 800)
    return () => clearInterval(i)
  }, [])

  const select = (id) => {
    localStorage.setItem('ms_ai_current_session', id)
  }

  return (
    <ul className="space-y-1 overflow-y-auto h-[calc(100vh-8rem)] pr-1">
      {sessions.map(s => (
        <li key={s.id}>
          <button onClick={()=>select(s.id)} className={`w-full text-left px-3 py-2 rounded-lg ${sessionId===s.id?'bg-gray-100':'hover:bg-gray-50'}`}>
            <div className="text-sm font-semibold truncate">{s.title || 'New chat'}</div>
            <div className="text-[10px] text-gray-500">{new Date(s.updatedAt).toLocaleString()}</div>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default AIAssistant;
