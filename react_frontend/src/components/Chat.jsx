import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, Smile, ArrowLeft, Copy, Check } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import MarkdownMessage from './MarkdownMessage';
import { Twemoji } from './Twemoji';

const Chat = ({ socket, roomId, onLeaveRoom }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [userRole, setUserRole] = useState('user');
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [roomInfo, setRoomInfo] = useState({ name: roomId, id: roomId });
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const quickReplies = [
    { text: 'I need help coping with stress', emoji: '😔' },
    { text: 'Give me a breathing exercise', emoji: '🌿' },
    { text: 'Share a positive affirmation', emoji: '✨' },
    { text: 'How can I improve focus?', emoji: '💫' }
  ]

  useEffect(() => {
    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user_joined', (data) => {
      setMessages((prev) => [...prev, { 
        text: data.message, 
        sender: 'System', 
        role: 'user', 
        timestamp: new Date().toISOString(),
        system: true 
      }]);
      setOnlineUsers(data.count);
    });

    socket.on('user_left', (data) => {
      setMessages((prev) => [...prev, { 
        text: data.message, 
        sender: 'System', 
        role: 'user', 
        timestamp: new Date().toISOString(),
        system: true 
      }]);
      setOnlineUsers(data.count);
    });

    socket.on('room_full', (msg) => {
      alert(msg);
      onLeaveRoom();
    });

    socket.on('online_count', (count) => {
      setOnlineUsers(count);
    });

    socket.on('room_info', (info) => {
      setRoomInfo(info);
    });

    return () => {
      socket.off('chat_message');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('room_full');
      socket.off('online_count');
      socket.off('room_info');
    };
  }, [socket, onLeaveRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit('join_room', { username, role: userRole, roomId });
      setIsJoined(true);
      // Create a new session on join if no session selected
      // no session handling for peer chat
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      const message = {
        text: input,
        sender: username,
        role: userRole,
        timestamp: new Date().toISOString(),
        roomId
      };
      socket.emit('chat_message', message);
      setInput('');
      setShowEmojiPicker(false);
    }
  };

  // no session management for peer chat

  const handleEmojiSelect = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const copyRoomUrl = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 text-gray-900 bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-2xl">
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-2 mb-6 text-sm text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to rooms
          </button>

          <div className="mb-6">
            <h2 className="mb-1 text-xl font-bold text-gray-900">Join Room</h2>
            <div className="p-3 mb-3 border border-gray-200 rounded bg-gray-50">
              <p className="text-sm text-gray-700">Room: <span className="font-semibold text-gray-900 capitalize">{roomInfo.name}</span></p>
              <p className="text-xs text-gray-500">#{roomInfo.id}</p>
            </div>
            <button
              onClick={copyRoomUrl}
              className="flex items-center gap-2 mb-2 text-xs text-gray-600 hover:text-gray-900"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600">Link copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Share room link</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-600">Enter your details to start chatting</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block mb-2 text-xs font-semibold tracking-wide text-gray-700 uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && joinChat()}
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-semibold tracking-wide text-gray-700 uppercase">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setUserRole('user')}
                  className={`px-3 py-2 text-sm border rounded ${
                    userRole === 'user'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  User
                </button>
                <button
                  onClick={() => setUserRole('mentor')}
                  className={`px-3 py-2 text-sm border rounded ${
                    userRole === 'mentor'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Mentor
                </button>
              </div>
            </div>

            <button
              onClick={joinChat}
              disabled={!username.trim()}
              className="w-full py-2 text-sm font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              Join Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-stretch w-full h-full text-gray-900 bg-gray-50">
      <div className="flex-1 w-full flex flex-col h-[100vh] bg-white border-x border-gray-200">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={onLeaveRoom}
                  className="p-1 text-gray-600 rounded hover:text-gray-900 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-bold text-gray-900 capitalize truncate">{roomInfo.name}</h2>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 truncate">Welcome, {username}! • #{roomInfo.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50">
                <Users className="w-3.5 h-3.5 text-gray-700" />
                <span className="font-medium text-gray-700">{onlineUsers}</span>
              </div>
              <button
                onClick={copyRoomUrl}
                className="px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100 hover:text-gray-900"
              >
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-3 overflow-y-auto bg-white">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.system
                  ? 'justify-center'
                  : msg.sender === username
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              {msg.system ? (
                <div className="px-3 py-1.5 my-1 text-xs italic text-gray-600 bg-gray-50 border border-gray-200 rounded">
                  {msg.text}
                </div>
              ) : (
                <div className={`max-w-[75%] ${msg.sender === username ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      msg.role === 'mentor' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {msg.role === 'mentor' ? 'Mentor' : 'User'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {msg.sender} • {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    {msg.sender !== username && (
                      <img src="/MitraSetu-Mascot.jpg" alt="Mitra mascot" className="rounded-full shadow w-7 h-7" />
                    )}
                    <div
                      className={`px-3 py-2 border rounded-2xl ${
                        msg.sender === username
                          ? 'bg-[#E8F0FE] text-gray-900 border-[#C7D2FE]'
                          : 'bg-[#F8FAFC] text-gray-900 border-gray-200'
                      }`}
                    >
                      <MarkdownMessage text={String(msg.text ?? '')} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        <div className="px-4 pt-2 bg-white border-t border-gray-200">
          <div className="flex flex-wrap gap-2 pb-2">
            {quickReplies.map((q) => (
              <button
                key={q.text}
                onClick={() => setInput(q.text)}
                className="px-2 py-1 text-xs font-medium border border-gray-200 rounded-full bg-gray-50 hover:bg-gray-100"
              >
                <Twemoji>{q.emoji}</Twemoji> {q.text}
              </button>
            ))}
          </div>
          {/* Input */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-2.5 pr-12 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <div className="absolute transform -translate-y-1/2 right-2 top-1/2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-gray-500 rounded hover:text-gray-700 hover:bg-gray-100"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute right-0 mb-2 bottom-full">
                  <EmojiPicker onSelect={handleEmojiSelect} />
                </div>
              )}
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;