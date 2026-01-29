import React from 'react'
import { Nav } from '../components/nav'
import { AIAssistant } from '../components/AIAssistant'

// Simple sidebar for session history using localStorage
function ChatHistorySidebar() {
  const [sessions, setSessions] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('ms_ai_sessions') || '[]') } catch { return [] }
  })
  const [currentId, setCurrentId] = React.useState(() => localStorage.getItem('ms_ai_current_session'))

  React.useEffect(() => {
    const i = setInterval(() => {
      try { setSessions(JSON.parse(localStorage.getItem('ms_ai_sessions') || '[]')) } catch {}
    }, 1000)
    return () => clearInterval(i)
  }, [])

  const selectSession = (id) => {
    setCurrentId(id)
    localStorage.setItem('ms_ai_current_session', id)
    // Messages are handled inside AIAssistant/ConversationContext
  }

  return (
    <aside className="hidden w-64 pl-4 pr-2 border-r border-gray-200 md:block sticky top-24 h-[calc(100vh-6rem)]">
      <div className="mb-3 text-sm font-bold">Chats</div>
      <ul className="space-y-1 overflow-y-auto h-[calc(100%-2rem)] pr-1">
        {sessions.map(s => (
          <li key={s.id}>
            <button onClick={()=>selectSession(s.id)} className={`w-full text-left px-3 py-2 rounded-lg ${currentId===s.id?'bg-gray-100':'hover:bg-gray-50'}`}>
              <div className="text-sm font-semibold truncate">{s.title || 'New chat'}</div>
              <div className="text-[10px] text-gray-500">{new Date(s.updatedAt).toLocaleString()}</div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="flex w-full max-w-none pt-24 mx-auto h-[calc(100vh-6rem)]">
        <main className="flex-1 h-full px-0">
          <AIAssistant />
        </main>
      </div>
    </div>
  )
}



