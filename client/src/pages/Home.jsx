import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4().split('-')[0]; 
    setRoomId(id);
    toast.success('Created a new room');
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('ROOM ID & username is required');
      return;
    }
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') joinRoom();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              RN
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Realtime Notepad</h1>
              <p className="text-xs text-slate-400">Collaborative code & notes editor</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Room ID</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Paste your room id"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium
                        hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md"
              onClick={joinRoom}
            >
              Join Room
            </button>
            <button 
              className="flex-1 bg-slate-700/50 text-slate-200 py-3 px-4 rounded-lg font-medium border border-slate-600
                        hover:bg-slate-700/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 
                        focus:ring-opacity-50"
              onClick={createNewRoom}
            >
              Create New
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center pt-4">
            Tip: You can press <span className="inline-block px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md text-xs mx-1">Enter</span> in any field to join.
          </p>
        </div>
      </div>
    </div>
  );
}