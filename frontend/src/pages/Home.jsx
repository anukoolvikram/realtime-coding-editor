import React, { useState, useRef } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const usernameInputRef = useRef(null);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4().split('-')[0];
    setRoomId(id);
    toast.success('New room created! Enter a username to join.');
    usernameInputRef.current?.focus();
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('Room ID & Username are required.');
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md">
            <span className="text-white">{`C`}</span>
            <span className="text-blue-300 -mt-1">{`{}`}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Realtime Code</h1>
          <p className="text-sm text-gray-500">Share code, fast.</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label 
              htmlFor="roomId" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 
                         placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your Room ID"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}
            />
          </div>

          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              ref={usernameInputRef} // Assign the ref here
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 
                         placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
            />
          </div>

          <button
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold 
                       hover:bg-blue-700 transition-all duration-200 transform 
                       focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-sm"
            onClick={joinRoom}
          >
            Join Room
          </button>
        </div>
        
        {/* Footer Link */}
        <p className="text-center text-sm text-gray-600 pt-6">
          Don't have an invite?&nbsp;
          <span
            onClick={createNewRoom}
            className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer underline-offset-2 hover:underline"
          >
            Create a new room
          </span>
        </p>

      </div>
    </div>
  );
}