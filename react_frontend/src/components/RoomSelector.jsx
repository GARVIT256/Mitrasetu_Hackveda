import React, { useState, useEffect } from 'react';
import { Users, Plus, Copy, Check, Hash, Globe, Trash2 } from 'lucide-react';

const RoomSelector = ({ onJoinRoom, socket }) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(null);

  useEffect(() => {
    // Request available rooms when component mounts
    socket.emit('get_rooms');
    
    socket.on('rooms_list', (rooms) => {
      setAvailableRooms(rooms);
    });

    socket.on('room_created', (roomData) => {
      setAvailableRooms(prev => [...prev, roomData]);
    });

    socket.on('room_deleted', (roomId) => {
      setAvailableRooms(prev => prev.filter(r => r.id !== roomId));
    });

    return () => {
      socket.off('rooms_list');
      socket.off('room_created');
      socket.off('room_deleted');
    };
  }, [socket]);

  useEffect(() => {
    // Check if there's a room in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
      onJoinRoom(roomId);
    }
  }, [onJoinRoom]);

  const createRoom = () => {
    if (newRoomName.trim()) {
      const roomId = newRoomName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      socket.emit('create_room', { name: newRoomName, id: roomId });
      setNewRoomName('');
      setShowCreateRoom(false);
    }
  };

  const copyRoomUrl = (roomId) => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedRoom(roomId);
    setTimeout(() => setCopiedRoom(null), 2000);
  };

  const generateRandomRoom = () => {
    const adjectives = ['cozy', 'bright', 'peaceful', 'vibrant', 'awesome', 'creative', 'friendly', 'dynamic'];
    const nouns = ['chat', 'lounge', 'hub', 'space', 'room', 'zone', 'corner', 'place'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adj}-${noun}-${number}`;
  };

  const createRandomRoom = () => {
    const roomName = generateRandomRoom();
    socket.emit('create_room', { name: roomName.replace(/-/g, ' '), id: roomName });
  };

  const deleteRoom = (roomId) => {
    // Optimistically remove from UI
    setAvailableRooms(prev => prev.filter(r => r.id !== roomId));
    // Notify server (if supported)
    socket.emit('delete_room', roomId);
  };

  return (
    <div className="h-full text-gray-900 bg-gray-50">
      <div className="flex h-full">
        {/* Left sidebar (rooms) */}
        <aside className="flex flex-col bg-white border-r border-gray-200 w-72">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-sm font-semibold tracking-wide text-gray-800">Rooms</h2>
            <div className="ml-auto">
              <button
                onClick={() => setShowCreateRoom((s) => !s)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white transition bg-indigo-600 rounded hover:bg-indigo-700"
                title="Create custom room"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Create panel */}
          {showCreateRoom && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="New room name"
                  className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && createRoom()}
                />
                <button
                  onClick={createRoom}
                  disabled={!newRoomName.trim()}
                  className="px-3 py-2 text-sm font-semibold text-white transition bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="px-3 py-2 text-sm text-gray-700 transition border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Quick random */}
          <div className="px-4 py-3 border-b border-gray-200">
            <button
              onClick={createRandomRoom}
              className="w-full px-3 py-2 text-sm font-medium text-left transition rounded bg-gray-50 hover:bg-gray-100"
            >
              Quick random room
            </button>
          </div>

          {/* Room list */}
          <div className="flex-1 overflow-auto">
            {availableRooms.length === 0 ? (
              <div className="p-6 text-sm text-center text-gray-500">
                <Hash className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                No rooms yet
              </div>
            ) : (
              <ul className="p-2 space-y-1">
                {availableRooms.map((room) => (
                  <li key={room.id} className="group">
                    <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100">
                      <button
                        onClick={() => onJoinRoom(room.id)}
                        className="flex-1 text-left"
                        title={`Join #${room.id}`}
                      >
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {room.name}
                        </div>
                        <div className="text-xs text-gray-500">#{room.id} · {room.userCount} online</div>
                      </button>
                      <button
                        onClick={() => copyRoomUrl(room.id)}
                        className="p-1 text-gray-500 transition rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200/60 hover:text-gray-700"
                        title="Copy invite"
                      >
                        {copiedRoom === room.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteRoom(room.id)}
                        className="p-1 text-red-600 transition rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-700"
                        title="Delete room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Right content area (placeholder/info) */}
        <section className="flex-1 hidden p-8 md:block">
          <div className="max-w-2xl">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Select a room</h1>
            <p className="mb-6 text-sm text-gray-600">Choose a room from the left to start chatting. You can also create a new one.</p>
            <div className="p-4 bg-white border border-gray-200 rounded">
              <div className="flex items-center gap-2 mb-2 text-gray-800">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">Tips</span>
              </div>
              <ul className="pl-5 space-y-1 text-sm text-gray-700 list-disc">
                <li>Hover a room to copy invite link or delete it</li>
                <li>Click a room name to join</li>
                <li>Use the + button to create a custom room</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RoomSelector;