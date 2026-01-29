import React, { createContext, useContext, useState, useCallback } from 'react';

const ConversationContext = createContext(null);

export function ConversationProvider({ children }) {
  const [messages, setMessages] = useState([{
    id: 1,
    role: 'ai',
    text: "Hello! I'm here to listen and support you. How are you feeling today?",
    ts: Date.now()
  }]);

  const addMessage = useCallback((msg) => {
    const role = msg.role || msg.sender || 'user';
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ts: Date.now(), sender: role, role, ...msg }]);
  }, []);

  const replaceLastAIChunkAppend = useCallback((textFragment) => {
    setMessages(prev => {
      const copy = [...prev];
      // Find last AI message; append streaming chunk
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === 'ai') { copy[i] = { ...copy[i], text: (copy[i].text || '') + textFragment }; return copy; }
      }
      // If none, create new
  copy.push({ id: Date.now() + Math.random(), role: 'ai', sender: 'ai', text: textFragment, ts: Date.now() });
      return copy;
    });
  }, []);

  const clearConversation = useCallback(() => setMessages([]), []);

  const setConversation = useCallback((newMessages) => {
    setMessages(Array.isArray(newMessages) ? newMessages : []);
  }, []);

  return (
    <ConversationContext.Provider value={{ messages, addMessage, replaceLastAIChunkAppend, clearConversation, setConversation }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error('useConversation must be used within ConversationProvider');
  return ctx;
}
