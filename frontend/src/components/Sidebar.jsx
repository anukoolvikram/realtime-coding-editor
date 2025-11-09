// src/components/Sidebar.jsx
import React from 'react';
import {
  UsersIcon,
  LinkIcon,
  ArrowLeftOnRectangleIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

// A simple, reusable Avatar component
function Avatar({ username }) {
  const initial = username.charAt(0).toUpperCase() || '?';
  // Simple hash to get a consistent color
  const colorIndex = (username.charCodeAt(0) || 0) % 5;
  const colors = [
    'bg-blue-500 text-blue-100',
    'bg-green-500 text-green-100',
    'bg-yellow-500 text-yellow-100',
    'bg-red-500 text-red-100',
    'bg-indigo-500 text-indigo-100',
  ];

  return (
    <div className={`w-10 h-10 rounded-full flex items-center 
                     justify-center text-sm font-bold ${colors[colorIndex]}`}>
      {initial}
    </div>
  );
}

// Reusable Select component for settings
function SettingsSelect({ label, value, onChange, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 text-sm border border-gray-300 rounded-md 
                   bg-gray-50 focus:outline-none focus:ring-2 
                   focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );
}

export default function Sidebar({
  clients,
  copyRoomId,
  leaveRoom,
  downloadCode,
  language,
  theme,
  onLanguageChange,
  onThemeChange,
}) {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white 
                      border-r border-gray-200">

      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center 
                        justify-center text-white text-lg font-bold shadow-md">
          <span className="text-white">{`C`}</span>
          <span className="text-blue-300 -mt-1">{`{}`}</span>
        </div>
        <h1 className="text-lg font-bold text-gray-800 ml-2">Realtime Coder</h1>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">

        {/* Clients */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 flex 
                         items-center mb-3">
            <UsersIcon className="w-5 h-5 mr-2" />
            Clients ({clients.length})
          </h2>
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.socketId} className="flex items-center gap-2">
                <Avatar username={client.username} />
                <span className="text-sm text-gray-700 truncate">
                  {client.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-600 flex 
                         items-center border-t pt-4 border-gray-200">
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            Settings
          </h2>
          <SettingsSelect
            label="Language"
            value={language}
            onChange={onLanguageChange}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </SettingsSelect>

          <SettingsSelect
            label="Theme"
            value={theme}
            onChange={onThemeChange}
          >
            <option value="github">GitHub Light</option>
            <option value="xcode">Xcode Light</option>
            <option value="githubDark">GitHub Dark</option>
            <option value="dracula">Dracula</option>
            <option value="xcodeDark">Xcode Dark</option>
          </SettingsSelect>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={copyRoomId}
          className="w-full flex items-center justify-center gap-2 text-sm 
                     py-2.5 px-4 rounded-md text-gray-700 bg-gray-100
                     hover:bg-gray-200 transition"
        >
          <LinkIcon className="w-4 h-4" />
          Copy Room ID
        </button>
        <button
          onClick={downloadCode}
          className="w-full flex items-center justify-center gap-2 text-sm 
                     py-2.5 px-4 rounded-md text-gray-700 bg-gray-100
                     hover:bg-gray-200 transition"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Download Code
        </button>
        <button
          onClick={leaveRoom}
          className="w-full flex items-center justify-center gap-2 text-sm 
                     py-2.5 px-4 rounded-md text-white bg-red-600 
                     hover:bg-red-700 transition"
        >
          <ArrowLeftOnRectangleIcon className="w-4 h-4" />
          Leave Room
        </button>
      </div>
    </aside>
  );
}