import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import RoomSelector from '../components/RoomSelector';
import Chat from '../components/Chat';
import { Nav } from '../components/nav';

const PeerChat = () => {
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const joinRoom = (roomId) => {
    setCurrentRoom(roomId);
    // Update URL without refreshing the page
    const newUrl = `${window.location.pathname}?room=${roomId}`;
    window.history.pushState({}, '', newUrl);
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave_room', currentRoom);
    }
    setCurrentRoom(null);
    // Remove room from URL
    window.history.pushState({}, '', window.location.pathname);
  };

  if (!socket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Connecting to chat server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Nav />
      <main className="w-full px-0 pt-28 h-[calc(100vh-7rem)]">
        {currentRoom ? (
          <Chat 
            socket={socket} 
            roomId={currentRoom} 
            onLeaveRoom={leaveRoom}
          />
        ) : (
          <RoomSelector 
            onJoinRoom={joinRoom} 
            socket={socket}
          />
        )}
      </main>
    </div>
  );
};

export default PeerChat;